    echo "Installing deno..."
    curl -fsSL https://deno.land/x/install/install.sh | sh
    export PATH="/opt/buildhome/.deno/bin:$PATH" 

    echo "Installing ssgo..."
    deno install --reload -f --unstable --allow-read --allow-write --allow-net https://deno.land/x/ssgo/ssgo.ts 
    
    echo "Building docs website..."
    ssgo --sitemap=https://ssgo.netlify.app 

    echo "Copying some files to dist/..."
    cp _redirects robots.txt dist/