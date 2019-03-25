var fs = require("fs");
let response = fs.readFileSync("data.properties", "utf8");

var list = response.split(/\r?\n/);
var resultList = [];
var object = {};
var index = 1;
for (let i = 0; i < list.length; i++) {
    let line = list[i]

    if (line.indexOf("第") == 0) {
        object.index = index++;
        object.token = line.split("．")[0];
        object.score = line.split("．")[1];
        head = i;
    }

    if (head + 2 == i) object.line1 = line.trim();
    if (head + 3 == i) object.line2 = line.trim();

    if (head + 3 + 2 == i) object.result1 = line.trim();
    if (head + 3 + 4 == i) object.result2 = line.trim();
    if (head + 3 + 6 == i) object.result3 = line.trim();
    if (head + 3 + 8 == i) object.result4 = line.trim();
    if (head + 3 + 8 == i) resultList.push(Object.assign({}, object, {}));
    //console.log(i + " : " + line)

}

let data = { data : resultList}
var content = JSON.stringify(data, null , 2);
fs.writeFileSync("data.json", content, 'utf8');

// console.log(resultList.length);
// for (let i=0; i < resultList.length; i++) {
//     let data = resultList[i];
//     if (data.index != (i+1)) {console.log("Missing " + (i+1)) ; break; }
//     //console.log("Missing " + (i + 1));
// }
