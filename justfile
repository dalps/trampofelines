default:
    npm run dev

build:
    npx vite build

linecount:
    find src/ -name '*.ts' | xargs wc -lc