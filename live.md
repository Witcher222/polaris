# Deploying POLARIS to Render.com (Securely)

Because POLARIS is a full-stack application with an Express backend and an SQLite database, **Render.com** is the perfect place to host it for free (or very cheap) without exposing your API keys.

By deploying this way, your `GEMINI_API_KEY` stays securely hidden on the server, and the public can never access it!

## Prerequisites
1. You have pushed your code to GitHub (which we just did!).
2. Create a free account at [Render.com](https://render.com).

## Step 1: Deploy the Backend (Express + SQLite)
Since our backend uses an SQLite database, a paid server would keep your data forever. However, since you are likely using the **Free Tier ($0/month)**, the data will wipe when the server sleeps. *But don't worry!* Our backend code automatically re-ingests live data from NASA and OpenAlex whenever it wakes up, so your demo will always work perfectly!

1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub account and select the `polaris` repository.
3. Configure the Web Service:
   * **Name:** `polaris-api`
   * **Language:** `Node`
   * **Branch:** `main`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
4. **Environment Variables (Crucial Step):**
   * Scroll down to "Environment Variables" and click "Add Environment Variable".
   * Add `GEMINI_API_KEY` and paste your Google Gemini API key as the value.
   * *(Optional)* Add `ADMIN_PASSWORD` to secure your admin account.
5. **Skip the Persistent Disk (for Free Tier):**
   * Since Render's Free tier ($0/month) doesn't support persistent disks, your SQLite database will reset whenever the server goes to sleep.
   * *But don't worry!* Our backend is smart. On startup, it checks if the database is empty, and if it is, it automatically triggers an ingestion to fetch fresh data from NASA, OpenAlex, and Zenodo!
6. Click **Deploy Web Service** at the bottom.

*Render will now build your backend. Copy the URL it gives you (e.g., `https://polaris-api.onrender.com`).*

## Step 2: Deploy the Frontend (React + Vite)
Now we will deploy the user-facing website as a separate **Static Site**.

1. Go back to the Render Dashboard, click **New +**, and select **Static Site**.
2. Select your `polaris` GitHub repository again.
3. Configure the Static Site:
   * **Name:** `polaris-web`
   * **Branch:** `main`
   * **Build Command:** `npm install && npm run build`
   * **Publish Directory:** `dist`
4. **Environment Variables:**
   * Add a new environment variable named `VITE_API_URL`.
   * Set its value to the URL of the backend you just created in Step 1 (e.g., `https://polaris-api.onrender.com`).
   * *Note: Notice how we are NOT adding the Gemini key here. The frontend never needs it!*
5. Click **Create Static Site**.

## You're Live!
Once Render finishes building the Static Site, click the URL they provide. You will see POLARIS live on the internet! 

When you use the AI Content Studio, your frontend will securely talk to your Render backend, which will then use the hidden `GEMINI_API_KEY` to talk to Google. Completely safe!