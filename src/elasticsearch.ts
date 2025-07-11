import { Client } from "@elastic/elasticsearch";
import { log } from "./logger";
import { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";
import { config } from "./config";

class ElasticSearch {
  public elasticSearchClient: Client;
  constructor() {
    this.elasticSearchClient = new Client({
      node: config.ELASTIC_SEARCH_URL,
    });
  }

  public async checkConnection() {
    let isConnected = false;
    while (!isConnected) {
      log.info("Users service connecting to Elasticsearch...");
      try {
        const health: ClusterHealthResponse =
          await this.elasticSearchClient.cluster.health({});
        log.info(
          `Users service Elasticsearch connection successful: ${health.status}`
        );
        isConnected = true;
      } catch (error) {
        log.error("Users service Elasticsearch connection error:", error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}

export const elasticsearch = new ElasticSearch();

export const elasticSearchClient = elasticsearch.elasticSearchClient;
