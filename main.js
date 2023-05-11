require('dotenv').config();
let KiteConnect = require("kiteconnect").KiteConnect;

const fastify = require("fastify")({logger: true});

let kc = new KiteConnect({"api_key": process.env.API_KEY});

fastify.get("/", async (request, reply) => {
    login_url = kc.getLoginURL();
    reply.type("text/html")
    .send(`<a href=${login_url}><h1>Login to generate access token.</h1></a>`)
});

fastify.get("/api/redirect_url_kite", async (request, reply) => {
    request_token = request.query.request_token;
    const res = await kc.generateSession(request_token, process.env.API_SECRET)
    kc.setAccessToken(res.access_token);
    reply.redirect("/dashboard");
});

fastify.get("/dashboard", async (request, reply) => {
    const positions = await kc.getPositions();
    summary = [];
    overall_pnl = 0;
    for (let pos of positions['day']) {
        summary.push({
            "tradingsymbol": pos.tradingsymbol,
            "pnl": pos.pnl
        });
        overall_pnl += pos.pnl;
    }
    console.log(overall_pnl);
    return summary;
});

const start = async () => {
  try {
    await fastify.listen({ port: 3010 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

