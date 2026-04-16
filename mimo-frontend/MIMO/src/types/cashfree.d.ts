declare module "@cashfreepayments/cashfree-js" {
  interface Cashfree {
    checkout(options: {
      paymentSessionId: string;
      redirectTarget: "_self" | "_blank" | "_modal";
    }): Promise<void>;
  }

  export function load(options: {
    mode: "sandbox" | "production";
  }): Promise<Cashfree>;
}