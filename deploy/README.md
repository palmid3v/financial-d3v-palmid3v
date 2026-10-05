# Private deployment artifacts

These artifacts provide a provider-neutral container baseline for Financial-D3v.

## API

Build from the repository root:

~~~bash
docker build -f deploy/api.Dockerfile -t financial-d3v-api .
~~~

The API container expects runtime configuration through environment variables. Do not bake Firebase credentials into the image.

## Frontend

Build:

~~~bash
docker build -f deploy/frontend.Dockerfile -t financial-d3v-frontend .
~~~

The frontend image serves the already-built Vite application.

For the frontend API URL, set VITE_API_BASE_URL before npm run build; Vite environment values are compile-time configuration.

## Production principle

Keep the API and frontend private and reachable only through the chosen private network / ingress. Configure the API's CORS_ALLOWED_ORIGINS to the exact frontend origin.
