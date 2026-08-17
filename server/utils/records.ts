import type { Document } from "mongodb";
import { cleanupImages, stageImages } from "./images";
import { getCollection } from "./mongo";

type ImageRecord = Document & {
  slug: string;
  cover: string;
  gallery: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export async function listRecords<T extends ImageRecord>(collectionName: string) {
  const collection = await getCollection<T>(collectionName);
  return collection
    .find({}, { projection: { _id: 0 } })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();
}

export async function upsertRecord<T extends ImageRecord>(
  collectionName: string,
  kind: "bike" | "led",
  record: T,
) {
  const collection = await getCollection<T>(collectionName);
  const existing = await collection.findOne({ slug: record.slug } as never);
  const staged = await stageImages(kind, record.slug, record.gallery, existing?.gallery || []);
  const next = {
    ...record,
    cover: staged.urls[0],
    gallery: staged.urls,
    updatedAt: new Date(),
    createdAt: existing?.createdAt || new Date(),
  } as T;

  try {
    await collection.replaceOne({ slug: record.slug } as never, next, { upsert: true });
  } catch (error) {
    await cleanupImages(staged.created);
    throw error;
  }

  await cleanupImages(staged.removedAfterCommit);
  return next;
}

export async function deleteRecord(collectionName: string, slug: string) {
  const collection = await getCollection<ImageRecord>(collectionName);
  const existing = await collection.findOne({ slug });
  if (!existing) return false;
  await collection.deleteOne({ slug });
  await cleanupImages(existing.gallery || []);
  return true;
}

export async function resetRecords<T extends ImageRecord>(
  collectionName: string,
  kind: "bike" | "led",
  records: T[],
) {
  const collection = await getCollection<T>(collectionName);
  const existing = await collection.find({}, { projection: { slug: 1, gallery: 1 } }).toArray();
  const existingBySlug = new Map(existing.map((item) => [item.slug, item]));
  const stagedRecords: T[] = [];
  const created: string[] = [];
  const removedAfterCommit: string[] = [];

  try {
    for (const record of records) {
      const staged = await stageImages(
        kind,
        record.slug,
        record.gallery,
        existingBySlug.get(record.slug)?.gallery || [],
      );
      created.push(...staged.created);
      removedAfterCommit.push(...staged.removedAfterCommit);
      stagedRecords.push({
        ...record,
        cover: staged.urls[0],
        gallery: staged.urls,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T);
    }
    if (stagedRecords.length) {
      await collection.bulkWrite(
        stagedRecords.map((record) => ({
          replaceOne: {
            filter: { slug: record.slug },
            replacement: record,
            upsert: true,
          },
        })),
      );
    }
    const keptSlugs = stagedRecords.map((record) => record.slug);
    const staleRecords = existing.filter((item) => !keptSlugs.includes(item.slug));
    await collection.deleteMany(keptSlugs.length ? { slug: { $nin: keptSlugs } } : {});
    await cleanupImages([
      ...removedAfterCommit,
      ...staleRecords.flatMap((item) => item.gallery || []),
    ]);
    return stagedRecords;
  } catch (error) {
    await cleanupImages(created);
    throw error;
  }
}
