# Stage 1: Build the application with Maven 3.9.9 and Java 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source tree and package Spring Boot executable JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lean Java 21 JRE runtime environment
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy executable JAR produced in Stage 1
COPY --from=builder /app/target/*.jar app.jar

# Default port fallback (Render dynamically overrides PORT at runtime)
ENV PORT=8080
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]

