# Simple Chess

یک بازی شطرنج ساده‌ی دونفره با React و Vite، بدون بک‌اند.

## امکانات

- نمایش صفحه‌ی ۸×۸ و مهره‌ها در وضعیت اولیه
- انتخاب مهره و نمایش خانه‌های مجاز
- قوانین پایه‌ی حرکت مهره‌ها
- جابه‌جایی و گرفتن مهره‌ی حریف
- مدیریت نوبت سفید و سیاه
- نمایش تاریخچه‌ی حرکت‌ها
- شروع مجدد بازی
- طراحی واکنش‌گرا برای دسکتاپ و موبایل
- استقرار خودکار با GitHub Actions و GitHub Pages

## لینک نسخه‌ی منتشرشده

[مشاهده‌ی بازی روی GitHub Pages](https://fatemehhamdi.github.io/SeLab1/)

پس از push شدن شاخه‌ی `main`، workflow موجود در
`.github/workflows/deploy.yml` پروژه را build کرده و روی GitHub Pages منتشر می‌کند.

## اجرای محلی

پیش‌نیاز: Node.js و npm

```bash
npm install
npm run dev
```

سپس آدرس نمایش‌داده‌شده توسط Vite، معمولاً
`http://localhost:5173`، را در مرورگر باز کنید.

## بررسی و build

```bash
npm run lint
npm run build
npm run preview
```

برای بررسی نسخه‌ی production، بعد از build دستور `npm run preview` را اجرا کنید.

## استقرار با GitHub Actions

فایل `.github/workflows/deploy.yml` در push به `main` این مراحل را اجرا می‌کند:

1. نصب Node.js و وابستگی‌ها با `npm ci`
2. اجرای lint
3. ساخت نسخه‌ی production با `npm run build`
4. بارگذاری پوشه‌ی `dist` به‌عنوان artifact
5. انتشار artifact با GitHub Pages

در تنظیمات repository نیز باید در بخش **Settings → Pages**، منبع انتشار روی
**GitHub Actions** قرار داشته باشد.

## گزارش Git

### شاخه‌ها

- شاخه‌ی اصلی توسعه: `main`
- remote مربوط به GitHub: `origin`
- remote مربوط به GitLab: `gitlab`

برای مشاهده‌ی شاخه‌ها و remoteها:

```bash
git branch -a
git remote -v
```

### commitهای پروژه

| Issue | Commit |
|---|---|
| Issue 1 | `c7b1976` — راه‌اندازی اولیه‌ی پروژه |
| Issue 2 و 3 | `2af0461` — ساختار صفحه و صفحه‌ی شطرنج |
| Issue 4 | `c35c416` — انتخاب مهره و خانه‌های مجاز |
| تکمیل Issue 4 | `a8d992d` — نمایش اطلاعات مهره‌ی انتخاب‌شده |
| Issue 5 | `d85fd5a` — قوانین پایه‌ی حرکت |
| Issue 6 | `1eb3ca4` — جابه‌جایی و گرفتن مهره |
| Issue 7 | `8e8096b` — مدیریت نوبت و وضعیت بازی |
| Issue 8 | `13ecc3d` — تاریخچه و شروع مجدد |
| Issue 9 | `5ca4966` — طراحی واکنش‌گرا |

### conflictها

در تاریخچه‌ی فعلی پروژه conflict ثبت‌شده‌ای وجود ندارد و merge conflict حل‌شده‌ای
در commitهای موجود گزارش نشده است. برای بررسی وضعیت و تاریخچه:

```bash
git status
git log --oneline --graph --decorate --all
```

## پرسش‌های نظری Git

### تفاوت Git و GitHub چیست؟

Git یک سیستم کنترل نسخه‌ی توزیع‌شده و محلی است؛ GitHub یک سرویس آنلاین برای
نگهداری repository، همکاری تیمی، issue، pull request و CI/CD است.

### تفاوت commit و push چیست؟

`commit` تغییرات را در تاریخچه‌ی محلی Git ثبت می‌کند. `push` commitهای محلی را
به remote مانند GitHub یا GitLab ارسال می‌کند.

### تفاوت merge و rebase چیست؟

`merge` تاریخچه‌ی دو شاخه را با یک merge commit ترکیب می‌کند. `rebase` commitهای
یک شاخه را روی نوک شاخه‌ی دیگر بازپخش می‌کند و تاریخچه‌ای خطی‌تر می‌سازد.

### conflict چیست و چگونه حل می‌شود؟

Conflict زمانی رخ می‌دهد که Git نتواند تغییرات دو شاخه را به‌صورت خودکار ترکیب
کند. باید بخش‌های علامت‌گذاری‌شده با `<<<<<<<`، `=======` و `>>>>>>>` را بررسی،
نسخه‌ی صحیح را انتخاب، فایل را ذخیره و سپس با `git add` و `git commit` نتیجه را
ثبت کرد.

### تفاوت `git fetch` و `git pull` چیست؟

`fetch` اطلاعات remote را دریافت می‌کند اما شاخه‌ی فعلی را تغییر نمی‌دهد.
`pull` ابتدا fetch و سپس merge یا rebase را اجرا می‌کند.

### فایل `.gitignore` چه کاربردی دارد؟

این فایل مشخص می‌کند چه فایل‌ها و پوشه‌هایی مانند `node_modules` و `dist` نباید
در Git ثبت شوند.
