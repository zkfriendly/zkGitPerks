# zkGitPerks Circuits

This repository contains Circom circuits used in the zkGitPerks application. The circuits are all based on ZkEmail and they verify various emails. A complete list of supported emails can be found in the `src` directory.

# Building locally

## ptau files

in order to build and compile the circuits locally, you'll need to have a ptau file that supports at least 4m constraints. you can obtain them [here](https://github.com/iden3/snarkjs/blob/master/README.md).

once you downloaded the ptau file create a directory called ptau:

```
mkdir ptau
```

and put the the `.ptau` file with the name `pot22_final.ptau` in the `ptau` directory

## install the dependencies

install the project dependencies by running:

```
yarn
```

## building

### .EML files

put the email you want to prove using the circuits under `emls` directory and reference it in the `inputs.ts` file in the `scripts` directory of the desired project.

you can build each circuit using it's folder name in the `src` directory. for example to build the `zkbill` circuit run the following command:

### Generating the artifacts

```
./build.sh zkbill
```

this will produce the relevant files under `artifacts` directory. 

### Deploying to sindri (WIP)

at this point you need to manually edit the  `compile_and_prove.py` script to deploy the circuits to sindri