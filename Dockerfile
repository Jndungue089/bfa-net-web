FROM node:24.22.1-alpine
WORKDIR /app
COPY . .
ARG BACKEND_URL=http://localhost:5080
ENV BACKEND_URL=$BACKEND_URL
RUN corepack enable && pnpm install --frozen-lockfile && pnpm build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["pnpm", "start"]