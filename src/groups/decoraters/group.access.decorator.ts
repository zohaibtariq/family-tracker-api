import { SetMetadata } from '@nestjs/common';

export const GroupAccess = (groupAccess: any) =>
  SetMetadata('groupAccess', groupAccess);
