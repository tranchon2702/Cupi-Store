import type { Document } from "mongodb";
import {
  DEFAULT_VEHICLE_OPTIONS,
  type VehicleOption,
  type VehicleOptionKind,
} from "../../src/data/vehicle-options";
import { getCollection } from "./mongo";

type VehicleOptionRecord = VehicleOption & Document & { createdAt?: Date; updatedAt?: Date };

const fieldByKind = {
  brand: "brand",
  type: "type",
  machine: "machine",
} as const;

const normalizeSlugPart = (value: string) =>
  value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function ensureVehicleOptions() {
  const options = await getCollection<VehicleOptionRecord>("vehicle_options");
  const bikes = await getCollection<Document & { slug: string }>("bikes");
  const settings = await getCollection<Document & { slug: string }>("app_settings");
  const now = new Date();
  const existingOptions = await options.find({}).toArray();
  const initialized = await settings.findOne({ slug: "vehicle-options-initialized" });
  const discovered = initialized ? [] : [...DEFAULT_VEHICLE_OPTIONS];

  for (const kind of ["brand", "type", "machine"] as const) {
    const field = fieldByKind[kind];
    const values = (await bikes.distinct(field)).filter(
      (value): value is string => typeof value === "string" && Boolean(value.trim()),
    );
    for (const name of values) {
      if (
        ![...existingOptions, ...discovered].some(
          (option) => option.kind === kind && option.name === name,
        )
      ) {
        discovered.push({ slug: `${kind}-${normalizeSlugPart(name)}`, kind, name });
      }
    }
  }

  if (discovered.length) {
    await options.bulkWrite(
      discovered.map((option) => ({
        updateOne: {
          filter: { slug: option.slug },
          update: { $setOnInsert: { ...option, createdAt: now, updatedAt: now } },
          upsert: true,
        },
      })),
    );
  }
  if (!initialized) {
    await settings.updateOne(
      { slug: "vehicle-options-initialized" },
      { $setOnInsert: { slug: "vehicle-options-initialized", createdAt: now } },
      { upsert: true },
    );
  }
  return options;
}

export async function listVehicleOptions() {
  const collection = await ensureVehicleOptions();
  return collection
    .find({}, { projection: { _id: 0 } })
    .sort({ kind: 1, createdAt: 1 })
    .toArray();
}

export async function addVehicleOption(kind: VehicleOptionKind, name: string) {
  const collection = await ensureVehicleOptions();
  const duplicate = await collection.findOne({
    kind,
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
  });
  if (duplicate) throw new Error("Danh mục này đã tồn tại.");
  const base = `${kind}-${normalizeSlugPart(name) || "option"}`;
  let slug = base;
  let counter = 2;
  while (await collection.findOne({ slug })) slug = `${base}-${counter++}`;
  const record: VehicleOptionRecord = {
    slug,
    kind,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await collection.insertOne(record);
  return { slug, kind, name };
}

export async function renameVehicleOption(slug: string, name: string) {
  const collection = await ensureVehicleOptions();
  const existing = await collection.findOne({ slug });
  if (!existing) return null;
  const duplicate = await collection.findOne({
    slug: { $ne: slug },
    kind: existing.kind,
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
  });
  if (duplicate) throw new Error("Danh mục này đã tồn tại.");

  const bikes = await getCollection<Document & { slug: string }>("bikes");
  const field = fieldByKind[existing.kind];
  const usageFilter =
    existing.kind === "machine" && existing.name === "Máy zin"
      ? {
          $or: [
            { machine: "Máy zin" },
            { machine: { $exists: false } },
            { machine: null },
            { machine: "" },
          ],
        }
      : { [field]: existing.name };
  await bikes.updateMany(usageFilter, { $set: { [field]: name, updatedAt: new Date() } });
  await collection.updateOne({ slug }, { $set: { name, updatedAt: new Date() } });
  return { slug, kind: existing.kind, name };
}

export async function deleteVehicleOption(slug: string) {
  const collection = await ensureVehicleOptions();
  const existing = await collection.findOne({ slug });
  if (!existing) return false;
  const bikes = await getCollection<Document & { slug: string }>("bikes");
  const field = fieldByKind[existing.kind];
  const usageFilter =
    existing.kind === "machine" && existing.name === "Máy zin"
      ? {
          $or: [
            { machine: "Máy zin" },
            { machine: { $exists: false } },
            { machine: null },
            { machine: "" },
          ],
        }
      : { [field]: existing.name };
  const used = await bikes.countDocuments(usageFilter);
  if (used > 0) {
    throw new Error(`Đang có ${used} xe sử dụng mục này. Hãy đổi thông tin xe trước khi xóa.`);
  }
  await collection.deleteOne({ slug });
  return true;
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
