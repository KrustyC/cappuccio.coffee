import { Handler, HandlerEvent } from "@netlify/functions";
import { jsonResponse } from "../shared/utils";
import { ObjectId } from "mongodb";
import { connect } from "../shared/mongodb-client";
import { HTTP_METHODS } from "../shared/constants";

const PLACES_COLLECTION = "places";

async function get(event: HandlerEvent) {
  try {
    const client = await connect();
    if (!client) {
      throw new Error("Can not connect to DB");
    }

    const { id } = event.queryStringParameters as { id?: string };

    if (id) {
      const place = await client
        .db(process.env.MONGO_DB_NAME)
        .collection(PLACES_COLLECTION)
        .findOne({ _id: new ObjectId(id) });

      if (!place) {
        return jsonResponse({
          status: 404,
          body: {
            message: "Project not found",
          },
        });
      }

      return jsonResponse({
        status: 200,
        body: { place },
      });
    }

    const places = await client
      .db(process.env.MONGO_DB_NAME)
      .collection(PLACES_COLLECTION)
      .find()
      .toArray();

    return jsonResponse({
      status: 200,
      body: { places },
    });
  } catch (error) {
    return jsonResponse({
      status: 500,
      body: {
        message: "Error fetching places, please try again later on.",
      },
    });
  }
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== HTTP_METHODS.GET) {
    return jsonResponse({
      status: 405,
      body: { message: "Method not allowed" },
    });
  }

  return get(event);
};

export { handler };