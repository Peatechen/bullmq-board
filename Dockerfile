# ===== server-builder ===== #
FROM harbor.turboost.dev/ci/images/node-builder:1.0.0 AS builder

WORKDIR /app

# 拷贝 package 文件
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile -r

COPY . .

RUN pnpm build

# ===== runtime ===== #
FROM node:16-alpine as runtime

# 设置环境变量
ENV NODE_ENV production
ENV PORT 80

# 设置工作目录
WORKDIR /app

# 复制服务端文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/dist/ ./dist/

# 暴露端口
EXPOSE 80

CMD [ "node", "dist/index.js" ]
