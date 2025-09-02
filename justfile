default:
    parallel -j 2 just ::: serve watch

serve:
    cp index.html dist
    live-server dist

serve-esbuild:
    cp index.html dist
    esbuild --minify --bundle src/main.ts --outdir=dist --watch --serve --servedir=dist

watch:
    esbuild --minify --bundle src/main.ts --outdir=dist --watch=forever

build:
    esbuild --minify --bundle src/main.ts --outdir=dist

linecount:
    find src/ -name '*.ts' | xargs wc -lc