export class Session {
  constructor(
    private readonly id: string,
    private userId: string,
    private deviceId: string,
    private ip: string,
    private title: string,
    private lastActiveDate: Date,
    private sessionExpiresAt: Date,
  ) {}

  updateActivityForDevice(ttlMs: number): void {
    const now = new Date();
    this.lastActiveDate = now;
    this.sessionExpiresAt = new Date(now.getTime() + ttlMs);
  }

  isExpired(): boolean {
    return new Date() > this.sessionExpiresAt;
  }
}
