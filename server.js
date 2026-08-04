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
        },{
            plugin: HapiPostgresConnection
        },
        {
            plugin: Inert,
        },
        {
            plugin: require("@hapi/vision"),
        },
    ]);

    server.views({
        engines: {
            hbs: require("handlebars"),
        },
        path: path.join(__dirname, "views"),
        layout: "default",
    });
    server.route([
        {
            method: "GET",
            path: "/",
            handler: (request, h) => {
                return h.file("welcome.html");
            },
        },{
            method: "GET",
            path: "/database",
            handler: async (request, h) => {
                let email = "test@test.net";
                let select = `SELECT * FROM user WHERE ${email}`;

                try {
                    const result = await request.pg.client.query(insertData);
                    console.log(result);
                    return h.response(result.rows[0]);
                }catch (err){
                    console.log(err);
                }
            }
        },
        {
            method: "GET",
            path: "/dynamic",
            handler: (request, h) => {
                const data = {
                    name: "Beans",
                };
                return h.view("index", data);
            },
        },
        {
            method: "POST",
            path: "/login",
            handler: (request, h) => {
                return h.view("index", { username: request.payload.username });
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
                    return h.view("location", {location: request.location.ip});
                } else {
                    return h.view("location", {location: "Your Location is not enabled!"});
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
