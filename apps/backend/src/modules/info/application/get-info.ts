import { getPlatformInfo, type PlatformInfo } from "@backend/modules/info/domain/platform-info";

export const getInfo = (): PlatformInfo => getPlatformInfo();
