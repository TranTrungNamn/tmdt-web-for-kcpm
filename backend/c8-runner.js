require("./server");
const v8 = require("v8");

console.log("");
console.log("==============================================");
console.log("[C8] BACKEND DANG DUOC DO COVERAGE");
console.log("[C8] Hay chay BVA bang Postman/Newman ngay bay gio");
console.log("[C8] Server se tu dung sau 3 phut");
console.log("==============================================");
console.log("");

setTimeout(() => {
    console.log("");
    console.log("[C8] Dang ghi V8 coverage...");
    v8.takeCoverage();

    setTimeout(() => {
        console.log("[C8] Hoan tat - dang thoat de c8 tao report.");
        process.exit(0);
    }, 1000);
}, 3000000);
