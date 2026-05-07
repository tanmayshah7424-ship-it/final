FROM node:20

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY frontend/package*.json ./frontend/

# Install Node dependencies
RUN npm install
RUN npm install --prefix server
RUN npm install --prefix frontend

# Copy Python requirements
COPY ai/engine/requirements.txt .

# Install Python dependencies
RUN pip3 install --break-system-packages -r requirements.txt

# Copy project
COPY . .

# Build frontend
RUN npm run build --prefix frontend

EXPOSE 5001

CMD ["npm", "start"]