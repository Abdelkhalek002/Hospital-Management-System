export class Student {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.verified = data.verified === 1 ? true : data.verified;
    this.createdAt = new Date(data.createdAt);
  }

  // Business logic methods
  isVerified() {
    return this.verified === true;
  }

  canLogin() {
    return this.isVerified();
  }

  // For API responses
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      verified: this.verified,
      createdAt: this.createdAt,
    };
  }

  toSignupResponse() {
    return {
      studentId: this.id,
      email: this.email,
      username: this.username,
    };
  }
}
