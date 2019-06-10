import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false,
    });
}

export async function createProject(options) {
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd(),
    };

    const currentFileUrl = import.meta.url;
    const templateDir = path.resolve(
        new URL(currentFileUrl).pathname,
        '../../templates',
        options.template.toLowerCase()
    );
    
    let regex = /%20/g;
    let dir = templateDir.replace(regex, ' ').substring(3);
    options.templateDirectory = dir;

    try {
        await access(dir, fs.constants.R_OK);
    } catch (err) {
        console.error('%s Invalid template name', chalk.red.bold('ERROR'));
        process.exit(1);
    }

    console.log('Copy project files');
    try {
        await copyTemplateFiles(options);
    } catch (err) {
        console.log('Error: ', err);
    }

    console.log('%s Project ready', chalk.green.bold('DONE'));
    return true;
}