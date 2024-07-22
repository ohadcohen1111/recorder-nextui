// src/utils/jwtState.ts
class JWTState {
    private static instance: JWTState;
    private expired: boolean = false;
  
    private constructor() {}
  
    public static getInstance(): JWTState {
      if (!JWTState.instance) {
        JWTState.instance = new JWTState();
      }
      return JWTState.instance;
    }
  
    public isExpired(): boolean {
      return this.expired;
    }
  
    public setExpired(value: boolean): void {
      this.expired = value;
    }
  }
  
  export default JWTState.getInstance();
  