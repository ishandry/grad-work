import React, { Component } from "react";
import followIfLoginRedirect from "./api-authorization/followIfLoginRedirect";
import {
  WeatherForecastsClient,
  TodoListsClient,
  TodoItemsClient,
  UpdateItemSubtitleCommand,
} from "../web-api-client.ts";

export class FetchData extends Component {
  static displayName = FetchData.name;

  constructor(props) {
    super(props);
    this.state = { forecasts: [], loading: true };
  }

  componentDidMount() {
    this.populateWeatherData();
  }

  static renderForecastsTable(forecasts) {
    return (
      <table className="table table-striped" aria-labelledby="tableLabel">
        <thead>
          <tr>
            <th>Date</th>
            <th>Temp. (C)</th>
            <th>Temp. (F)</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map((forecast) => (
            <tr key={forecast.date}>
              <td>{new Date(forecast.date).toLocaleDateString()}</td>
              <td>{forecast.temperatureC}</td>
              <td>{forecast.temperatureF}</td>
              <td>{forecast.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render() {
    let contents = this.state.loading ? (
      <p>
        <em>Loading...</em>
      </p>
    ) : (
      FetchData.renderForecastsTable(this.state.forecasts)
    );

    return (
      <div>
        <h1 id="tableLabel">Weather forecast</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
      </div>
    );
  }

  async populateWeatherData() {
    let client = new WeatherForecastsClient();
    const data = await client.getWeatherForecasts();
    let listClient = new TodoListsClient();
    const listId = await listClient.createTodoList({ title: "TestDeployed5" });
    const itemClient = new TodoItemsClient();
    const itemId = await itemClient.createTodoItem({
      listId: listId,
      title: "TestDeployedItem1",
    });
    await itemClient.updateItemSubtitle(itemId,{
      id: itemId,
      subTitle: "TestDeployedItem1Subtitle1",
    });

    const items = await itemClient.getTodoItemsWithPagination(listId, 1, 10);

    console.log("items", items);

    this.setState({ forecasts: data, loading: false });
  }

  async populateWeatherDataOld() {
    const response = await fetch("weatherforecast");
    followIfLoginRedirect(response);
    const data = await response.json();
    this.setState({ forecasts: data, loading: false });
  }
}
