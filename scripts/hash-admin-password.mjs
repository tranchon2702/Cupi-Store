import bcrypt from "bcryptjs";

if (!process.stdin.isTTY) {
  console.error("Hãy chạy lệnh này trực tiếp trong terminal để nhập mật khẩu an toàn.");
  process.exit(1);
}

process.stdout.write("Nhập mật khẩu admin mới: ");
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

let password = "";
for await (const char of process.stdin) {
  if (char === "\u0003") process.exit(130);
  if (char === "\r" || char === "\n") break;
  if (char === "\u007f" || char === "\b") {
    if (password.length) {
      password = password.slice(0, -1);
      process.stdout.write("\b \b");
    }
    continue;
  }
  password += char;
  process.stdout.write("*");
}

process.stdin.setRawMode(false);
process.stdout.write("\n");

if (password.length < 12) {
  console.error("Mật khẩu phải có ít nhất 12 ký tự.");
  process.exit(1);
}

console.log(await bcrypt.hash(password, 12));
