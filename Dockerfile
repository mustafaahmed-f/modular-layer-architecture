FROM node:22.16.0 as base

From base as development

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
CMD ["npm","run","dev"]
EXPOSE 3000


From base as builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Remove dev dependencies to slim the build before copying
RUN npm prune --production

From node:22.16.0-alpine as production

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

CMD ["npm","run","prod"]
EXPOSE 3000
