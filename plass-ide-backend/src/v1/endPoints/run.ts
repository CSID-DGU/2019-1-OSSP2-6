import {ChildProcess, spawn} from "child_process";
import * as express from "express";
import * as crypto from "crypto";

import { getUserPath  } from "../../helper/path-helper";
import connection from "../../connection";

const dockerInstance: {
    [key: string]: IDockerInstance;
} = {};

interface IDockerInstance {
    process: ChildProcess;
    stdout: IDockerOutput[];
}

interface IDockerOutput {
    data: string;
    error: boolean;
    closed: boolean;
}

const run = async (req: express.Request, res: express.Response) => {
    const id = parseInt(req.params.id, 10);
    const { user } = req.user;
    if(!id) { res.status(400).send("no projects"); return;}

    const [rows] = await connection.execute("SELECT * FROM projects WHERE id = ? AND user = ? AND enabled = true", [id, user.id]);
    if(rows.length != 1) { res.status(400).send("no data"); return; }
    const result = rows[0];

    const sourcePath = getUserPath({...user, ...result});
    
    let docker = null;

    switch(result.category) {
        case "java":
            docker = spawn("docker", ["run", "--rm", "-v", `${sourcePath}:/src`, "java-build:1.0"]);
            break;
        case "c":
            docker = spawn("docker", ["run", "--rm", "-v", `${sourcePath}:/src`, "c-build:1.0"]);
            break;
    }

    const hash = crypto.createHmac("sha256", "")
        .update(new Date().toString())
        .digest("hex"); // hash value for seperate result

    res.status(201).json({ hash }); // send result hash

    dockerInstance[hash] = {
        process: docker,
        stdout: []
    };

    docker.stdout.on("data", (data) => {
        dockerInstance[hash].stdout.unshift({
                data: data.toString(),
                closed: false,
                error: false
            });
    });

    docker.stdout.on("end", () => {
        dockerInstance[hash].stdout.unshift({
            data: "",
            closed: true,
            error: false
        });
    });

    docker.stderr.on("data", (data) => {
        dockerInstance[hash].stdout.unshift({
            data: data.toString(),
            closed: false,
            error: false
        });
    });

    docker.stderr.on("end", () => {
        if (dockerInstance[hash].stdout.length === 0) {
            return;
        }

        dockerInstance[hash].stdout.unshift({
            data: "",
            closed: true,
            error: false
        });
    });
};

const input = async (req: express.Request, res: express.Response) => {

};

const result = async (req: express.Request, res: express.Response) => {
    const hash = req.params.hash;
    if (!dockerInstance[hash]) {
        res.status(404).end();
        return;
    }

    if(dockerInstance[hash].stdout.length > 0) {
        const result = dockerInstance[hash].stdout.pop();

        res.status(200).json({
            error: result.error,
            data: result.data,
            closed: result.closed,
        });
        return;
    } 

    res.status(200).json({
        wait: true
    });
};

export const runEndPoint = {
    run,
    input,
    result
};
