FROM node:20-alpine AS frontend-build
WORKDIR /app/ems-frontend
COPY ems-frontend/package*.json ./
RUN npm ci
COPY ems-frontend/ ./
RUN npm run build

FROM eclipse-temurin:25-jdk AS backend-build
WORKDIR /app/ems-backend
COPY ems-backend/mvnw ./
COPY ems-backend/.mvn ./.mvn
COPY ems-backend/pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline
COPY ems-backend/src ./src
COPY --from=frontend-build /app/ems-frontend/dist ./src/main/resources/static
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
ENV PORT=8081
COPY --from=backend-build /app/ems-backend/target/ems-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","app.jar"]
