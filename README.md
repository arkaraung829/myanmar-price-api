# Myanmar Price API

A Cloudflare Worker API for Myanmar market prices - currency exchange, gold, and fuel.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `/` | API info |
| `/currency` | Market exchange rates |
| `/currency/official` | Official CBM rates |
| `/gold` | Gold prices |
| `/fuel` | Fuel/petrol prices |
| `/all` | All prices combined |

## Setup & Deploy

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open a browser to authenticate.

### 3. Install dependencies

```bash
cd myanmar-price-api
npm install
```

### 4. Test locally

```bash
npm run dev
```

Then open http://localhost:8787

### 5. Deploy to Cloudflare

```bash
npm run deploy
```

You'll get a URL like: `https://myanmar-price-api.YOUR_USERNAME.workers.dev`

## Example Response

### GET /currency

```json
{
  "source": "Market Rate",
  "type": "market",
  "rates": {
    "USD": { "buy": "3920", "sell": "4020" },
    "EUR": { "buy": "4537", "sell": "4668" }
  },
  "timestamp": "2026-03-07T08:00:00.000Z"
}
```

### GET /gold

```json
{
  "source": "MarketPricePro",
  "category": "Gold",
  "prices": [
    { "name": "16 Pae", "price": "6,900,000" }
  ],
  "timestamp": "2026-03-07T08:00:00.000Z"
}
```

## Custom Domain (Optional)

1. Go to Cloudflare Dashboard > Workers > Your Worker
2. Click "Triggers" tab
3. Add custom domain (e.g., api.yourdomain.com)

## Data Sources

- **Official rates**: Central Bank of Myanmar (forex.cbm.gov.mm)
- **Market rates**: MarketPricePro API
- **Gold/Fuel**: MarketPricePro API
