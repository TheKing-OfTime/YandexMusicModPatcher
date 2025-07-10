import { promises as fsp } from 'fs';
import fs from 'fs';
import patch from './patch';


export default class deeplinkCommands {

    static async loadCommands() {
        let commands = [{ name: 'patch', run: patch }];

        // TODO Разобраться с вебпаком чтобы main не бандлился а копировался.
        // // Получаем список всех папок в src/main/deeplinkCommands/
        // const dirPath = __dirname;
        // const entries = await fsp.readdir(dirPath, { withFileTypes: true });
        // for (const entry of entries) {
        //     if (entry.isDirectory()) {
        //         const indexPath = `${dirPath}/${entry.name}/index.js`;
        //         if (fs.existsSync(indexPath)) {
        //             const command = await import(indexPath);
        //             commands.push({ name: entry.name, run: command.default || command.run || command});
        //         }
        //     }
        // }

        return commands;
    }

    constructor() {
        return (async () => {
            this.commands = await deeplinkCommands.loadCommands();
            return this;
        })();
    }
    async runCommand(commandName, ...args) {
        const command = this.commands.find(cmd => cmd.name === commandName);
        if (command) {
            return command.run(...args);
        } else {
            throw new Error(`Command ${commandName} not found`);
        }
    }
}
