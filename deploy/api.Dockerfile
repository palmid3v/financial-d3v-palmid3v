FROM golang:1.27-bookworm AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/financial-d3v-api ./cmd/api

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/financial-d3v-api /financial-d3v-api
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/financial-d3v-api"]
