echo "Installing nvm and node@14.3.0"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 14.3.0

echo "Installing deno..."
curl -fsSL https://deno.land/x/install/install.sh | sh
export PATH="/opt/buildhome/.deno/bin:$PATH"

echo "Installing velociraptor..."
deno install -qA -n vr https://deno.land/x/velociraptor/cli.ts

echo "Installing ssgo..."
deno install --reload -f --unstable --allow-read --allow-write --allow-net https://deno.land/x/ssgo/ssgo.ts

echo "Building docs website..."
vr build

echo "Copying some files to dist/..."
cp _redirects robots.txt dist/