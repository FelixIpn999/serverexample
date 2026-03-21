# ==========================================
# ETAPA 1: BUILD (Constructor)
# ==========================================
FROM node:20-alpine AS builder

#Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalamos TODAS las dependencias (incluyendo TypeScript para poder compilar)
RUN npm ci

# Copiamos el resto del código fuente
COPY . .

# Compilamos TypeScript a JavaScript (esto crea la carpeta /app/dist)
RUN npm run build


# ==========================================
# ETAPA 2: PRODUCCIÓN (Artefacto ligero)
# ==========================================
FROM node:20-alpine AS production

# Buena práctica de seguridad: entorno de producción y usuario sin privilegios
ENV NODE_ENV=production
USER node
WORKDIR /usr/src/app

# Copiamos package.json
COPY --chown=node:node package*.json ./

# Instalamos SOLO dependencias de producción (excluye TypeScript, Jest, etc.)
RUN npm ci --only=production && npm cache clean --force

# Copiamos la carpeta compilada 'dist' desde la Etapa 1
COPY --chown=node:node --from=builder /app/dist ./dist

# Exponemos el puerto
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["node", "dist/server.js"]