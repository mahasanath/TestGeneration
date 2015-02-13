### HW #2 Test Generation and Coverage      

Submitted by, Mahalaxmi Sanathkumar (smahala@ncsu.edu)   


Coverage Report
-----------------------------
The uncovered items in the given code have been covered and the automation of new tests for 100% branch and statement coverage has been achieved.    


### Below are the snapshots of the Test Generation Result:   


#### Screenshots
---------------------------------------------------------
```bash
![image1](https://github.com/mahasanath/TestGeneration/blob/master/codecoverage_testgen.JPG)    


![image2](https://github.com/mahasanath/TestGeneration/blob/master/coverage_Subjectjs.JPG)     

The console when generating the test.js and the coverage report for subject.js:    

![image3](https://github.com/mahasanath/TestGeneration/blob/master/coverage_console.JPG)
```



























Get started.

    git clone https://github.com/CSC-DevOps/TestGeneration.git
    cd TestGeneration
    npm install

### Getting a simple coverage report

[Useful resource](http://ariya.ofilabs.com/2012/12/javascript-code-coverage-with-istanbul.html) for istanbul.

You can run the local version as follows:

    node_modules/.bin/istanbul cover test.js
    node_module\.bin\istanbul cover test.js (Windows)

To install istanbul globally, saving some keystrokes, you can do the following:

    npm install istanbul -G

You'll get a high level report as follows (a more detailed report will be stored in `coverage/`):
<pre>
=============================== Coverage summary ===============================

Statements   : 80% ( 4/5 )
Branches     : 50% ( 1/2 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 4/4 )
================================================================================
</pre>


### Test Generation with Constraints and Mocking

Run `node main.js` to generate `test.js`.  The code under test is `subject.js`.

* 1) Use the `mock-fs` framework to generate a fake file system to help improve coverage.
* 2) Use the `faker` framework to generate a fake phone number to help improve coverage.
* 3) Extend the constraint discovery code to handle `>` and `<`.
* 4) Use clues in the code to automate the process of including file system, phone number mocking without manual injection.

[faker.js docs](https://github.com/Marak/faker.js), [mock-fs docs](https://www.npmjs.com/package/mock-fs)

##### You can see a better visualization of the results here:
    
    open coverage/lcov-report/TestGeneration/subject.js.html

### Test Generation in Java

Download randoop:

    wget https://randoop.googlecode.com/files/randoop.1.3.4.jar

Sample execution to generate tests for all classes in the java.util.Collections namespace (Need Java 7):

    java -classpath randoop.1.3.4.jar randoop.main.Main gentests --testclass=java.util.TreeSet --testclass=java.util.Collections --timelimit=60

This will create a file `RandoopTest.java`, which contains a test driver, and `RandoopTest0.java`, which contains the generated unit tests.

### Coverage in Java

[Emma](http://emma.sourceforge.net/intro.html) is a decent option to collect coverage information form a java program.
