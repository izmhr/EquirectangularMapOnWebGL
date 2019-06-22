export function Foo(): void {
  console.log("foo from sub.ts");
}

export function Boo(): void {
  console.log("boo from sub.ts");
}

export default class SSS {
  public Add(x: number, y:number): number {
    return x + y;
  }
}