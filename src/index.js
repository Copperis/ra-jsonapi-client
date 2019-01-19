import { stringify } from 'qs';
import merge from 'deepmerge';
import axios from 'axios';
import {
  GET_LIST, GET_ONE, CREATE, UPDATE, DELETE, GET_MANY,
} from './actions';
import serialize from './serialize';
import defaultSettings from './default-settings';
import { NotImplementedError } from './errors';
import init from './initializer';

// Set HTTP interceptors.
init();

/**
 * Maps react-admin queries to a JSONAPI REST API
 *
 * @param {string} apiUrl the base URL for the JSONAPI
 * @param {string} userSettings Settings to configure this client.
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the request type
 * @returns {Promise} the Promise for a data response
 */
export default (apiUrl, userSettings = {}) => async (type, resource, params) => {
  let url = '';
  const settings = merge(defaultSettings, userSettings);

  const options = {
    headers: settings.headers,
    withCredentials: true,
  };

  switch (type) {
    case GET_LIST: {
      const { page, perPage } = params.pagination;
      // TODO: Allow sorting, filtering etc.
      const query = {
        'page[number]': page,
        'page[size]': perPage,
      };
      url = `${apiUrl}/${resource}?${stringify(query)}`;
      break;
    }

    case GET_ONE:
      url = `${apiUrl}/${resource}/${params.id}`;
      break;

    case CREATE:
      url = `${apiUrl}/${resource}`;
      options.method = 'POST';
      options.data = JSON.stringify({
        data: { type: resource, attributes: params.data },
      });
      break;

    case UPDATE: {
      url = `${apiUrl}/${resource}/${params.id}`;

      const data = {
        data: {
          id: params.id,
          type: resource,
          attributes: params.data,
        },
      };

      options.method = 'PUT';
      options.data = JSON.stringify(data);
      break;
    }

    case DELETE:
      url = `${apiUrl}/${resource}/${params.id}`;
      options.method = 'DELETE';
      break;

    case GET_MANY: {
      const query = {
        filter: JSON.stringify({ id: params.ids }),
      };
      url = `${apiUrl}/${resource}?${stringify(query)}`;
      break;
    }

    default:
      throw new NotImplementedError(
        `Unsupported Data Provider request type ${type}`,
      );
  }

  const response = await axios({ url, ...options });
  switch (type) {
    case GET_LIST: {
      return {
        data: serialize(response.data.data),
        total: settings.getTotal(response.data.meta),
      };
    }

    case GET_ONE: {
      const { id, attributes } = response.data.data;

      return {
        data: {
          id,
          ...attributes,
        },
      };
    }

    case CREATE: {
      const { id, attributes } = response.data.data;

      return {
        data: {
          id,
          ...attributes,
        },
      };
    }

    case UPDATE: {
      const { id, attributes } = response.data.data;

      return {
        data: {
          id,
          ...attributes,
        },
      };
    }

    case DELETE: {
      return {
        data: { id: params.id },
      };
    }

    default:
      throw new NotImplementedError(
        `Unsupported Data Provider request type ${type}`,
      );
  }
};
