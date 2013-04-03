#!/bin/sh
rm timeline.js
cat tools/combine/header.txt >> timeline.js

cat src/Util.js >> timeline.js
echo "\\n" >> timeline.js

cat src/View.js >> timeline.js
echo "\\n" >> timeline.js

for var in `ls src | grep -v "^Util.js$" | grep -v "^View.js$"`
do
    cat src/$var >> timeline.js
    echo "\\n" >> timeline.js
done
cat tools/combine/footer.txt >> timeline.js


java -jar ~/bin/yuicompressor-2.4.7.jar timeline.js > timeline.min.js