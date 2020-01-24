String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


// --------------------------------------------------------------//
// --- Update package using package-template.json  and user input---//
// --------------------------------------------------------------//


var pkg = require('./package-template.json');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

// name
const question1 = () => {
    return new Promise((resolve, reject) =>{
        readline.question(`Package Name (all-lower-case-with-no-spaces-please): `, (name) => {
            pkg.name = name
            resolve()
        })
    })
}

// description
const question2 = () => {
    return new Promise((resolve, reject) => {
        readline.question(`Package Description (1 sentence description): `, (description) => {
            pkg.description = description
            resolve()
        })
    })
}

// keywords
const question3 = () => {
    return new Promise((resolve, reject) => {
        readline.question(`Package keywords(use commas between keywords): `, (keywords) => {
            pkg.keywords = keywords.split(",")
            resolve()
        })
    })
}

// org
const question4 = () => {
    return new Promise((resolve, reject) => {
        readline.question(`github user or organization (usually 'RhoInc'. Leave it blank if this isn't on github): `, (org) => {
            pkg.org = org
            updateProject(pkg)
            resolve()
        })
    })
}

function updateProject(pkg){
    // --- Create package.json ---//
    //main
    function camelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index == 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '')
            .replace(/-/g, '');
    }

    pkg.function= camelCase(pkg.name)
    pkg.main = './'+pkg.function+".js"
    pkg.scripts['format-bundle']= 'prettier --print-width=100 --tab-width=4 --single-quote --write ./' + pkg.function + '.js'

    //github urls
    if (pkg.org) {
        pkg.homepage = "https://github.com/" + pkg.org + "/" + pkg.name
        pkg.repository.url = pkg.homepage + ".git"
        pkg.bugs.url = pkg.homepage + "/issues"
    }

    // overwrite package.json
    const fs = require('fs');
    fs.writeFile('package.json', JSON.stringify(pkg, null, 4), (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log('package.json created.');
    });

    // ---------------------------------------------------//
    // --- Create a readme.md                          ---//
    // ---------------------------------------------------//

    var readme = '#' + pkg.name + '\n' + pkg.description;
    fs.writeFile('README.md', readme, (err) => {
        if (err) throw err;
        console.log('README.md created.');
    });

    // ---------------------------------------------------//
    // --- update ./src/index                          ---//
    // ---------------------------------------------------//
    fs.readFile('./src/index-template.js', "utf8", function (err, data) {
        if (err) throw err;
        var new_index = data.replaceAll("myPackageFunctionGoesHere", pkg.function)
        fs.writeFile('./src/index.js', new_index, (err) => {
            if (err) throw err;
            console.log('./src/index.js created.');
        });
    });

    // ---------------------------------------------------//
    // --- update ./test-page/index.html               ---//
    // ---------------------------------------------------//
    fs.readFile('./test-page/index-template.html', "utf8", function (err, data) {
        if (err) throw err;
        var new_example = data
            .replaceAll("myPackageNameGoesHere", pkg.name)
            .replaceAll("myPackageFunctionGoesHere", pkg.function)
            .replaceAll("myPackageURLGoesHere", pkg.homepage)

        fs.writeFile('./test-page/index.html', new_example, (err) => {
            if (err) throw err;
            console.log('./test-page/index.html created.');
        });
    });

}

const main = async () => {
    await question1()
    await question2()
    await question3()
    await question4()
    readline.close()
}

main()