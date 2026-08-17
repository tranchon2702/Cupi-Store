import { defineHandler } from "h3";
import { listVehicleOptions } from "../../../utils/vehicle-options";

export default defineHandler(() => listVehicleOptions());
