"use strict";

const Hapi = require("@hapi/hapi");
const Inert = require("@hapi/inert");
const path = require("path");

const init = async () => {
    const server = Hapi.Server({
        host: "localhost",
        port: 1234,
        routes: {
            files: {
                relativeTo: path.join(__dirname, "static"),
            },
        },
    });

    await server.register([
        {
            plugin: require("hapi-geo-locate"),
            options: {
                enabledByDefault: true,
            },
        },
        {
            plugin: Inert,
        },
    ]);

    server.route([
        {
            method: "GET",
            path: "/",
            handler: (request, h) => {
                return h.file("welcome.html");
            },
        },
        {
            method: "GET",
            path: "/download",
            handler: (request, h) => {
                return h.file("welcome.html");
            },
        },
        {
            method: "GET",
            path: "/location",
            handler: (request, h) => {
                if (request.location) {
                    return request.location;
                } else {
                    return "<h1>Your location is not enabled by default</h1>";
                }
            },
        },
        {
            method: "GET",
            path: "/users/{user?}",
            handler: (request, h) => {
                //One way to get a detail from the domain name
                if (request.params.user) {
                    return `<h1>Hello ${request.params.user}</h1>`;
                } else {
                    return `<h1>Hello Stranger!</h1>`;
                }

                //if localhost:1234/uses?name=ben&lastname=bean, ben bean will be displayed on page
                // return `<h1>${request.query.name} ${request.query.lastname}</h1>`;
            },
        },
        {
            method: "GET",
            path: "/{any*}",
            handler: (request, h) => {
                return "<h1>Oh No! You must be Lost!</h1>";
            },
        },
    ]);

    await server.start();
    console.log(`Server started on: ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});

init();
