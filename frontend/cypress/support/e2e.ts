// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
// ***********************************************************

import "./commands";
import "cypress-mochawesome-reporter/register";
import "@cypress/code-coverage/support";

// Prevent uncaught exceptions from failing tests (e.g. 3rd party scripts or minor UI warnings)
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

// ============================================================================
// 🎬 SLOW MOTION MODE: Tự động thêm khoảng dừng sau mỗi thao tác
// Giúp con người quan sát trực quan từng bước click, gõ phím, chọn màu sắc
// ============================================================================
// ms (khoảng dừng 0.35s giữa các thao tác)
const COMMAND_DELAY = 350;

const interactiveCommands = [
  "click",
  "type",
  "clear",
  "check",
  "uncheck",
  "select",
] as const;

interactiveCommands.forEach((command) => {
  Cypress.Commands.overwrite(command as any, (originalFn, subject: any, ...args) => {
    let target = subject;
    // Nếu subject có nhiều hơn 1 phần tử khi click mà không truyền multiple: true, tự động click phần tử đầu tiên
    if (command === "click" && subject && subject.length > 1) {
      const options = args[args.length - 1] as Record<string, any> | undefined;
      if (!options || typeof options !== "object" || !options.multiple) {
        target = typeof subject.first === "function" ? subject.first() : subject;
      }
    }

    return originalFn(target, ...args).then((result: any) => {
      return new Cypress.Promise((resolve) => {
        setTimeout(() => resolve(result), COMMAND_DELAY);
      });
    });
  });
});
