#!/bin/sh

repo_dir=$(cd $(dirname $0);pwd)/../

rm ${repo_dir}timeline.js
cat ${repo_dir}tools/combine/header.txt >> ${repo_dir}timeline.js

cat ${repo_dir}src/Util.js >> ${repo_dir}timeline.js
echo "\\n" >> ${repo_dir}timeline.js

cat ${repo_dir}src/View.js >> ${repo_dir}timeline.js
echo "\\n" >> ${repo_dir}timeline.js

for var in `ls ${repo_dir}src | grep -v "^Util.js$" | grep -v "^View.js$"`
do
    cat ${repo_dir}src/$var >> ${repo_dir}timeline.js
    echo "\\n" >> ${repo_dir}timeline.js
done
cat ${repo_dir}tools/combine/footer.txt >> ${repo_dir}timeline.js


java -jar ~/lib/yuicompressor-2.4.7.jar ${repo_dir}timeline.js > ${repo_dir}timeline.min.js