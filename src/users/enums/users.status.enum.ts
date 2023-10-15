export enum UserStatus {
  UNVERIFIED = 'unverified', // NOTE: user is newly created OTP not verified
  VERIFIED = 'verified', // NOTE: user is OTP verified
  BLOCKED = 'blocked', // NOTE: Blocked by admin or super admin will add more if required
}
