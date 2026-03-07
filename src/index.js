/**
 * Myanmar Price API - Cloudflare Worker
 * Provides currency exchange rates, gold prices, and fuel prices
 *
 * Data Sources:
 * 1. Primary: Telegram Channels (YGEA for gold reference, myanmargoldP for market prices)
 * 2. Secondary: MarketPricePro API
 * 3. Official: Central Bank of Myanmar for official rates
 */

// Configuration - Set these in wrangler.toml or Cloudflare dashboard
// TELEGRAM_BOT_TOKEN: Your Telegram bot token (create via @BotFather)
// MMP_TOKEN: MarketPricePro token (backup source)

// Fallback tokens (move to environment variables for production)
const MMP_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IiIsImlkIjoyMzUxMywiaWF0IjoxNzQyNzg4NTI4LCJleHAiOjIwMDE5ODg1Mjh9.QP-P-6S3CuE3QLx-pWqeQKNshM3csFRaZ79y2wn_5UE';

// SDB API Configuration
const SDB_API_URL = 'https://spring-api.springdevelopmentbank.com';

// Pre-decrypted RSA private key for SDB API response decryption
// This key was extracted from SDB web app's JavaScript bundle
const SDB_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDUIK1Hq7kWq/aU
5+uZzImRTBPDY5aRLNqSvF/yOhydSxBla42KORbXpX7MINxMbBBLOesJ51YMGskC
MCAX3ImMLK7fKo81cXNf4FoQwNvOtAfP8NWHX6yUoFSgkIDFtCCnSmnM6G0hGPPt
s2Av4DglqWbCZcEfjG/aPKtHhaj5ZsIjdHybadxbDEMGOt5H4KSo9YauB0NfdC1T
sLc9ZOQGUyUS6S+3EukCjPj6QudurPvyXQ5zFYRpLB8LDm5AWC9BFaNsPuQQS392
OJPpS5X+4kX1VxPRp1sZxcJ2raSBfnbVYYOORZ1rzblK6FX+bPYFeMrJRL+8d6gK
RPb+R/gZAgMBAAECggEAAgheILWwjFsRfdPLGiovl0jXV6P4qWN4pLdRZAzSgV9a
xN4G+TAa2+4mDOaztbfDYDUp32psFKmdC3xSkmf2mXVEJ7dMsAJqTJzlwAtZD94B
xShVo3pzOOlgZjl8Qmi7d17rLJ99jDek/r4dSdgoMZQx++Llutupprm2GnVZbSpe
cZFHhdGL9h3yh+Sb/QqsuK6xW3AIx1vb55JhOJkMin6qnyjYOazKQDcVzs5ukooA
IPTYrVuIhhZK9x/ZJ34afgKYuQIwpUF8/Z8cYSS+1te4v84Ng2ujLjv4i0GtOERO
fIDKBxaQSx3xkd1DO3aXrbAFtNqDLyKbEBe2tSD2QQKBgQDy7Su4OAKYDDdJGiTC
fs9zadW2V9KWuVZe1MboR7ywkXsYmO6wlxpr8SwhLWK2rJz44S+eHDttnmnqlWCc
NtDGVabuZfHSeoqfbGknkJ6A1urxjMba16MrcDVRe+0kp+EEBDcHomCPyjPMk1Xi
eiReCBfgkZWpLpnXNPdXo/dHvQKBgQDfiy/dNvEj1WQz32RspBvjPbuEdkAADjaQ
xBjFl8n6koRvMnNo5nyYYLtUlVapBlAlu/18fETwoNiam6pyGiMiwjlqLeDGzfQj
QTVVaidh9gFHjo4N+y2FUdvyHBa5wiovoiy2rA+zQ78l3Y0czOpezjbEW3eiHKCW
qcbGJKQZjQKBgQDUnO2J00O57d8pVP9dVv2cJsIMUHsYveexIgtg2wBzjTCui5NE
7UsLtE4KT525AgR08yno+Q6uV1qeHNUsg/Ff1TFAL+thay0OcSTrovCHFRMWDD8y
5E6EQzX3Nj6MuX4ANOww+1YGI1QItd8SVBKmVfEH9IOHSikNKOdeRjy0BQKBgHKW
bHCeyzktF3Innti5vrnbWRXrb58XqgzHGFOhHR3eoRhG6jXpgBCz9RLEgmmeHNNa
6/M12Djoml+WT+axUzVsDfZJkiEWTYEM2gPwqENk0P8XKeYszQa8EVyn3VZXGzzT
iswQovOnVIJacQ1EVRdH6Xb50/c7aW4RlRzYh225AoGAB13WPIQ7YXP8eb2v4Rpo
vSLOGwWE9XSnFVrL0uFuGMH/O5Y8q/pJfSQOLbrmk6TSiHwfG9/XM8QC/6jaP2/2
qDvT3Hx+5U47or4d5BZseNRul4JmlID5po5RzNrZbCLKUvPnJ1EyMsmm9au69xfz
rifOI4iO+6Jk+58YcKIRWcA=
-----END PRIVATE KEY-----`;

// Pre-decrypted RSA public key for SDB API request encryption
const SDB_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy7gsNN3n+S3831qW1GgI
3f8he9vQ9rONSguc5PnhI114GM7FfcFE7NYIEZI/OZanXfvG+X24HzZo+eNkAIDb
BcoxXWsW4mazHAUE1GGmBwrDSpUGhRwEM1pdIjfR/HkDtsW5W6C4mxcm2d5VfEiR
sDHyCrK5gNvyhBM7hoiUG74lgkC+Bm96zJQB8tfLs92K4VxKqo4CmrWRSPj4D+8W
RQ/xSFcTkBk1JPwBK9F1eWBA2G6V1QXPJgR56YRQdSIJ2f14SSBwxqFz/R56aStQ
2KZHwQLInJBo+QcSYO0QQgzxkwoDYBAtH3Dp0JNuyz1Hkd5PeC+ZzPDLLSWGz31v
uwIDAQAB
-----END PUBLIC KEY-----`;

// Telegram channel usernames
const TELEGRAM_CHANNELS = {
  YGEA: 'ygea2017',              // Gold reference price (ရည်ညွှန်းစျေး) - images
  GOLD_MARKET: 'myanmargoldP',   // Gold & dollar prices
  DENKO: 'DenkoTrading',         // Fuel prices - images
  GOLD_CURRENCY: 'goldcurrencyupdate'  // Gold & currency TEXT updates (best source!)
};

// Cache duration in seconds
const CACHE_DURATION = 600; // 10 minutes

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    try {
      switch (path) {
        case '/':
          return jsonResponse({
            message: 'Myanmar Price API',
            version: '1.5.0',
            endpoints: {
              currency: ['/currency', '/currency/official', '/currency/sdb', '/currency/history/:code'],
              gold: ['/gold', '/gold/live', '/gold/best', '/gold/telegram', '/gold/ocr'],
              fuel: ['/fuel', '/fuel/live', '/fuel/best'],
              combined: ['/all'],
              sdb: ['/sdb/login', '/sdb/refresh', '/sdb/rates', '/sdb/decrypt'],
              meta: ['/sources'],
              debug: ['/debug/telegram/ygea', '/debug/telegram/denko', '/debug/telegram/goldcurrency'],
              admin: ['/admin/store-rates', '/admin/backfill?days=30'],
              ads: ['/ads']
            },
            recommended: {
              gold: '/gold/live - Real-time from @goldcurrencyupdate (TEXT)',
              goldBest: '/gold/best - Auto-selects best available source',
              currency: '/sdb/rates - Auto-login to SDB for real-time rates',
              fuel: '/fuel/best - OCR from @DenkoTrading or MarketPricePro fallback'
            },
            dataSources: {
              primary: '@goldcurrencyupdate (TEXT - no OCR needed)',
              backup: 'MarketPricePro',
              sdb: 'Spring Development Bank (requires Bearer token)',
              telegram: {
                goldcurrencyupdate: '@goldcurrencyupdate (Gold & USD - TEXT)',
                ygea: '@ygea2017 (Gold reference - images)',
                denko: '@DenkoTrading (Fuel prices - images)'
              },
              official: 'Central Bank of Myanmar (CBM)'
            }
          });

        case '/currency':
          return await getCurrencyWithSDBPrimary(env);

        case '/currency/official':
          return await getOfficialCurrency();

        case '/currency/sdb':
          return await getSDBCurrency(request);

        case '/sdb/decrypt':
          return await decryptSDBResponse(request);

        case '/sdb/login':
          return await sdbLogin(request);

        case '/sdb/refresh':
          return await sdbRefresh(request);

        case '/sdb/rates':
          return await getSDBRatesAuto(request, env);

        case '/gold':
          return await getGoldPrices();

        case '/gold/telegram':
          return await getGoldPricesWithTelegram(env);

        case '/fuel':
          return await getFuelPrices();

        case '/fuel/live':
          return await getFuelFromTelegram(env);

        case '/fuel/best':
          return await getBestFuelPrices(env);

        case '/all':
          return await getAllPrices();

        case '/sources':
          return await getSourcesStatus();

        case '/gold/ocr':
          return await getGoldPricesWithOCR(env);

        case '/debug/telegram/ygea':
          return await debugTelegramScrape(TELEGRAM_CHANNELS.YGEA);

        case '/debug/telegram/denko':
          return await debugTelegramScrape(TELEGRAM_CHANNELS.DENKO);

        case '/debug/telegram/goldcurrency':
          return await debugTelegramScrape(TELEGRAM_CHANNELS.GOLD_CURRENCY);

        case '/gold/live':
          return await getGoldFromTelegramText();

        case '/gold/best':
          return await getBestGoldPrices(env);

        case '/ads':
          return await getAds(env);

        default:
          // Handle dynamic routes
          const currencyHistoryMatch = path.match(/^\/currency\/history\/([A-Z]{3})$/);
          if (currencyHistoryMatch) {
            const code = currencyHistoryMatch[1];
            const days = parseInt(url.searchParams.get('days') || '7', 10);
            return await getCurrencyHistoryFromDB(env, code, Math.min(Math.max(days, 1), 90));
          }

          // Serve ad images from R2
          const adImageMatch = path.match(/^\/ads\/(.+\.(png|jpg|jpeg|gif|webp))$/i);
          if (adImageMatch) {
            const filename = adImageMatch[1];
            return await serveAdImage(env, filename);
          }

          // Backfill endpoint to populate historical data
          if (path === '/admin/backfill') {
            const days = parseInt(url.searchParams.get('days') || '30', 10);
            return await backfillHistoricalData(env, Math.min(days, 90));
          }

          // Manual trigger to store today's rates
          if (path === '/admin/store-rates') {
            return await storeDailyRates(env);
          }

          return jsonResponse({ error: 'Not found' }, 404);
      }
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  },

  // Scheduled handler - runs daily to store currency rates
  async scheduled(event, env, ctx) {
    ctx.waitUntil(storeDailyRates(env));
  }
};

// Get official CBM exchange rates
async function getOfficialCurrency() {
  const response = await fetch('https://forex.cbm.gov.mm/api/latest');
  const data = await response.json();

  return jsonResponse({
    source: 'Central Bank of Myanmar',
    type: 'official',
    rates: data.rates,
    timestamp: new Date().toISOString()
  });
}

// Get currency rates with SDB as primary, MMP as fallback
async function getCurrencyWithSDBPrimary(env) {
  try {
    // Try SDB first (requires SDB_EMAIL and SDB_PASSWORD env vars)
    const email = env?.SDB_EMAIL;
    const password = env?.SDB_PASSWORD;

    if (!email || !password) {
      // No SDB credentials, fall back to MMP
      return await getMarketCurrency();
    }

    let accessToken;
    let tokenSource = 'fresh_login';

    // Check for cached token in KV
    if (env?.SDB_TOKEN_CACHE) {
      const cachedToken = await env.SDB_TOKEN_CACHE.get('sdb_access_token');
      if (cachedToken) {
        accessToken = cachedToken;
        tokenSource = 'cached';
      }
    }

    // If no cached token, login to get new one
    if (!accessToken) {
      const encryptedPayload = await encryptJWE({ email, password });

      const loginResponse = await fetch(`${SDB_API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ encrypt: encryptedPayload })
      });

      if (!loginResponse.ok) {
        // SDB login failed, fall back to MMP
        return await getMarketCurrency();
      }

      const loginData = await loginResponse.json();

      if (loginData.encrypt) {
        const decrypted = await decryptJWE(loginData.encrypt);
        const parsedLogin = JSON.parse(decrypted);
        accessToken = parsedLogin.data?.access_token || parsedLogin.accessToken;
      } else {
        accessToken = loginData.data?.access_token || loginData.accessToken;
      }

      if (!accessToken) {
        return await getMarketCurrency();
      }

      // Cache the token for 9 minutes
      if (env?.SDB_TOKEN_CACHE) {
        await env.SDB_TOKEN_CACHE.put('sdb_access_token', accessToken, { expirationTtl: 540 });
      }
    }

    // Fetch exchange rates from SDB
    let ratesResponse = await fetch(`${SDB_API_URL}/v1/dashboard/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    // If token expired, clear cache and retry
    if (ratesResponse.status === 401 && tokenSource === 'cached') {
      if (env?.SDB_TOKEN_CACHE) {
        await env.SDB_TOKEN_CACHE.delete('sdb_access_token');
      }

      // Login again
      const encryptedPayload = await encryptJWE({ email, password });
      const loginResponse = await fetch(`${SDB_API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ encrypt: encryptedPayload })
      });

      if (!loginResponse.ok) {
        return await getMarketCurrency();
      }

      const loginData = await loginResponse.json();
      if (loginData.encrypt) {
        const decrypted = await decryptJWE(loginData.encrypt);
        const parsedLogin = JSON.parse(decrypted);
        accessToken = parsedLogin.data?.access_token || parsedLogin.accessToken;
      }

      if (env?.SDB_TOKEN_CACHE && accessToken) {
        await env.SDB_TOKEN_CACHE.put('sdb_access_token', accessToken, { expirationTtl: 540 });
      }

      ratesResponse = await fetch(`${SDB_API_URL}/v1/dashboard/summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      tokenSource = 'refreshed';
    }

    if (!ratesResponse.ok) {
      return await getMarketCurrency();
    }

    const ratesData = await ratesResponse.json();

    if (!ratesData.encrypt) {
      return await getMarketCurrency();
    }

    const decrypted = await decryptJWE(ratesData.encrypt);
    const parsed = JSON.parse(decrypted);
    const ratesObj = parsed.data || parsed;

    // Extract exchange rates
    const rates = {};
    const exchangeRatesData = ratesObj.exchange_rates?.rates || [];

    for (const rate of exchangeRatesData) {
      const code = rate.base_currency?.code;
      const buyRate = parseFloat(rate.buy_rate);
      const sellRate = parseFloat(rate.sell_rate);

      if (code && code !== 'GOLD' && code !== 'SDB') {
        rates[code] = {
          name: rate.base_currency?.name,
          buy: buyRate.toFixed(2),
          sell: sellRate.toFixed(2),
          buyFormatted: buyRate.toFixed(2) + ' MMK',
          sellFormatted: sellRate.toFixed(2) + ' MMK'
        };
      }
    }

    const lastUpdated = ratesObj.exchange_rates?.last_updated_at;

    return jsonResponse({
      source: 'Spring Development Bank',
      type: 'bank_rate',
      tokenSource,
      lastUpdated,
      rates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Any error, fall back to MMP
    return await getMarketCurrency();
  }
}

// Get market exchange rates from MarketPricePro
async function getMarketCurrency() {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(
    `https://api.marketpricepro.com/users/home_content/data?is_today=true&category_id=102&date=${today}`,
    {
      headers: {
        'Authorization': `Bearer ${MMP_TOKEN}`,
        'country': 'MM',
        'language': 'en',
        'Accept': 'application/json'
      }
    }
  );

  const data = await response.json();

  // Extract latest rates
  const rates = {};
  if (data.data && data.data[0] && data.data[0].sub_categories) {
    const items = data.data[0].sub_categories[0].items || [];

    // Group by currency and get latest
    const grouped = {};
    items.forEach(item => {
      const code = item.item_name;
      if (!grouped[code] || item.created_at_date > grouped[code].created_at_date) {
        grouped[code] = item;
      }
    });

    Object.values(grouped).forEach(item => {
      rates[item.item_name] = {
        buy: item.buy_price,
        sell: item.sell_price,
        date: item.created_at_date
      };
    });
  }

  return jsonResponse({
    source: 'Market Rate',
    type: 'market',
    rates,
    timestamp: new Date().toISOString()
  });
}

// Get historical currency rates from D1 database
async function getCurrencyHistoryFromDB(env, code, days = 7) {
  if (!env?.DB) {
    return jsonResponse({ error: 'Database not configured' }, 500);
  }

  try {
    const result = await env.DB.prepare(`
      SELECT date, buy_rate, sell_rate, source
      FROM currency_rates
      WHERE currency_code = ?
      ORDER BY date DESC
      LIMIT ?
    `).bind(code, days).all();

    const history = result.results.map(row => ({
      date: row.date,
      buy: row.buy_rate.toString(),
      sell: row.sell_rate.toString()
    }));

    return jsonResponse({
      currency: code,
      source: 'SDB (Historical DB)',
      days: days,
      history: history,
      dataPoints: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return jsonResponse({ error: 'Database query failed: ' + error.message }, 500);
  }
}

// Store daily rates from SDB to D1 database
async function storeDailyRates(env) {
  if (!env?.DB) {
    return jsonResponse({ error: 'Database not configured' }, 500);
  }

  const today = new Date().toISOString().split('T')[0];
  let rates = {};
  let source = 'SDB';

  try {
    // Try to get rates from SDB first
    const email = env?.SDB_EMAIL;
    const password = env?.SDB_PASSWORD;

    if (email && password) {
      // Login and get rates from SDB
      const encryptedPayload = await encryptJWE({ email, password });
      const loginResponse = await fetch(`${SDB_API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ encrypt: encryptedPayload })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        let accessToken;

        if (loginData.encrypt) {
          const decrypted = await decryptJWE(loginData.encrypt);
          const parsedLogin = JSON.parse(decrypted);
          accessToken = parsedLogin.data?.access_token || parsedLogin.accessToken;
        }

        if (accessToken) {
          const ratesResponse = await fetch(`${SDB_API_URL}/v1/dashboard/summary`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
          });

          if (ratesResponse.ok) {
            const ratesData = await ratesResponse.json();
            if (ratesData.encrypt) {
              const decrypted = await decryptJWE(ratesData.encrypt);
              const parsed = JSON.parse(decrypted);
              const ratesObj = parsed.data || parsed;
              const exchangeRatesData = ratesObj.exchange_rates?.rates || [];

              for (const rate of exchangeRatesData) {
                const code = rate.base_currency?.code;
                if (code && code !== 'GOLD' && code !== 'SDB') {
                  rates[code] = {
                    buy: parseFloat(rate.buy_rate),
                    sell: parseFloat(rate.sell_rate)
                  };
                }
              }
            }
          }
        }
      }
    }

    // If SDB failed, fall back to MMP
    if (Object.keys(rates).length === 0) {
      source = 'MMP';
      const response = await fetch(
        `https://api.marketpricepro.com/users/home_content/data?is_today=true&category_id=102&date=${today}`,
        {
          headers: {
            'Authorization': `Bearer ${MMP_TOKEN}`,
            'country': 'MM',
            'language': 'en',
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data?.[0]?.sub_categories?.[0]?.items) {
          const items = data.data[0].sub_categories[0].items;
          const grouped = {};
          items.forEach(item => {
            if (!grouped[item.item_name] || item.created_at_date > grouped[item.item_name].created_at_date) {
              grouped[item.item_name] = item;
            }
          });
          Object.values(grouped).forEach(item => {
            rates[item.item_name] = {
              buy: parseFloat(item.buy_price.replace(/,/g, '')),
              sell: parseFloat(item.sell_price.replace(/,/g, ''))
            };
          });
        }
      }
    }

    // Store rates in D1
    let stored = 0;
    for (const [code, rate] of Object.entries(rates)) {
      try {
        await env.DB.prepare(`
          INSERT OR REPLACE INTO currency_rates (date, currency_code, buy_rate, sell_rate, source)
          VALUES (?, ?, ?, ?, ?)
        `).bind(today, code, rate.buy, rate.sell, source).run();
        stored++;
      } catch (e) {
        console.error(`Failed to store ${code}:`, e.message);
      }
    }

    return jsonResponse({
      success: true,
      date: today,
      source: source,
      currenciesStored: stored,
      rates: rates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({ error: 'Failed to store rates: ' + error.message }, 500);
  }
}

// Backfill historical data from MMP (one-time use)
async function backfillHistoricalData(env, days = 30) {
  if (!env?.DB) {
    return jsonResponse({ error: 'Database not configured' }, 500);
  }

  const results = { success: [], failed: [] };
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    try {
      const response = await fetch(
        `https://api.marketpricepro.com/users/home_content/data?is_today=false&category_id=102&date=${dateStr}`,
        {
          headers: {
            'Authorization': `Bearer ${MMP_TOKEN}`,
            'country': 'MM',
            'language': 'en',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        results.failed.push({ date: dateStr, error: 'API error' });
        continue;
      }

      const data = await response.json();
      if (data.data?.[0]?.sub_categories?.[0]?.items) {
        const items = data.data[0].sub_categories[0].items;
        const grouped = {};
        items.forEach(item => {
          if (!grouped[item.item_name] || item.created_at_date > grouped[item.item_name].created_at_date) {
            grouped[item.item_name] = item;
          }
        });

        let stored = 0;
        for (const item of Object.values(grouped)) {
          try {
            await env.DB.prepare(`
              INSERT OR IGNORE INTO currency_rates (date, currency_code, buy_rate, sell_rate, source)
              VALUES (?, ?, ?, ?, 'MMP_BACKFILL')
            `).bind(
              dateStr,
              item.item_name,
              parseFloat(item.buy_price.replace(/,/g, '')),
              parseFloat(item.sell_price.replace(/,/g, ''))
            ).run();
            stored++;
          } catch (e) {
            // Ignore duplicate errors
          }
        }
        results.success.push({ date: dateStr, currencies: stored });
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));

    } catch (error) {
      results.failed.push({ date: dateStr, error: error.message });
    }
  }

  return jsonResponse({
    message: 'Backfill complete',
    daysProcessed: days,
    successful: results.success.length,
    failed: results.failed.length,
    details: results,
    timestamp: new Date().toISOString()
  });
}

// ============================================================
// ADS MANAGEMENT
// ============================================================

/**
 * Get ads for the app
 * Ads are stored in KV storage for easy management
 * To update ads: use /admin/ads endpoint (POST)
 */
async function getAds(env) {
  // Default ads configuration - edit these to change ads
  const defaultAds = [
    {
      id: 'oo_marketplace',
      title: 'OO Marketplace',
      description: 'Shop smart, shop local',
      imageUrl: 'https://mm-price-api.mmpriceapi.workers.dev/ads/oo-marketplace-banner.png',
      linkUrl: null, // Will be set based on platform in app
      appStoreUrl: 'https://apps.apple.com/app/oo-marketplace/id123456789',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.oomarketplace.app',
      isActive: true
    }
  ];

  try {
    // Try to get ads from KV storage first
    if (env?.ADS_CACHE) {
      const cachedAds = await env.ADS_CACHE.get('active_ads', { type: 'json' });
      if (cachedAds && cachedAds.length > 0) {
        return jsonResponse({
          ads: cachedAds,
          source: 'cache',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Return default ads
    return jsonResponse({
      ads: defaultAds,
      source: 'default',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      ads: defaultAds,
      source: 'fallback',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Serve ad images from R2 storage
async function serveAdImage(env, filename) {
  try {
    if (!env?.AD_IMAGES) {
      return new Response('R2 not configured', { status: 500 });
    }

    const object = await env.AD_IMAGES.get(filename);

    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    // Determine content type from extension
    const ext = filename.split('.').pop().toLowerCase();
    const contentTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };

    const headers = new Headers({
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      ...corsHeaders
    });

    return new Response(object.body, { headers });
  } catch (error) {
    return new Response(`Error serving image: ${error.message}`, { status: 500 });
  }
}

// Get gold prices from MarketPricePro
async function getGoldPrices() {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(
    `https://api.marketpricepro.com/users/home_content/data?is_today=true&category_id=103&date=${today}`,
    {
      headers: {
        'Authorization': `Bearer ${MMP_TOKEN}`,
        'country': 'MM',
        'language': 'en',
        'Accept': 'application/json'
      }
    }
  );

  const data = await response.json();

  // Extract latest gold prices
  const prices = [];
  if (data.data && data.data[0] && data.data[0].sub_categories) {
    data.data[0].sub_categories.forEach(subCat => {
      const items = subCat.items || [];
      const grouped = {};

      items.forEach(item => {
        const name = item.item_name_eng;
        if (!grouped[name] || item.created_at_date > grouped[name].created_at_date) {
          grouped[name] = item;
        }
      });

      Object.values(grouped).forEach(item => {
        prices.push({
          name: item.item_name_eng,
          name_mm: item.item_name_mm,
          price: item.price,
          date: item.created_at_date
        });
      });
    });
  }

  return jsonResponse({
    source: 'MarketPricePro',
    category: 'Gold',
    prices,
    timestamp: new Date().toISOString()
  });
}

// Get fuel prices from MarketPricePro
async function getFuelPrices() {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(
    `https://api.marketpricepro.com/users/home_content/data?is_today=true&category_id=104&date=${today}`,
    {
      headers: {
        'Authorization': `Bearer ${MMP_TOKEN}`,
        'country': 'MM',
        'language': 'en',
        'Accept': 'application/json'
      }
    }
  );

  const data = await response.json();

  // Extract latest fuel prices
  const prices = [];
  if (data.data && data.data[0] && data.data[0].sub_categories) {
    data.data[0].sub_categories.forEach(subCat => {
      const items = subCat.items || [];
      const grouped = {};

      items.forEach(item => {
        const name = item.item_name_eng;
        if (!grouped[name] || item.created_at_date > grouped[name].created_at_date) {
          grouped[name] = item;
        }
      });

      Object.values(grouped).forEach(item => {
        prices.push({
          name: item.item_name_eng,
          price: item.price,
          date: item.created_at_date
        });
      });
    });
  }

  return jsonResponse({
    source: 'MarketPricePro',
    category: 'Fuel',
    prices,
    timestamp: new Date().toISOString()
  });
}

// Get all prices combined
async function getAllPrices() {
  const [official, market, gold, fuel] = await Promise.all([
    fetch('https://forex.cbm.gov.mm/api/latest').then(r => r.json()),
    getMarketCurrencyData(),
    getGoldData(),
    getFuelData()
  ]);

  return jsonResponse({
    currency: {
      official: official.rates,
      market: market
    },
    gold,
    fuel,
    timestamp: new Date().toISOString()
  });
}

// Helper: Get market currency data
async function getMarketCurrencyData() {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(
    `https://api.marketpricepro.com/users/home_content/data?is_today=true&category_id=102&date=${today}`,
    {
      headers: {
        'Authorization': `Bearer ${MMP_TOKEN}`,
        'country': 'MM',
        'language': 'en'
      }
    }
  );
  const data = await response.json();

  const rates = {};
  if (data.data?.[0]?.sub_categories?.[0]?.items) {
    const items = data.data[0].sub_categories[0].items;
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.item_name] || item.created_at_date > grouped[item.item_name].created_at_date) {
        grouped[item.item_name] = item;
      }
    });
    Object.values(grouped).forEach(item => {
      rates[item.item_name] = { buy: item.buy_price, sell: item.sell_price };
    });
  }
  return rates;
}

// Helper: Get gold data
async function getGoldData() {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(
    `https://api.marketpricepro.com/users/home_content/data?is_today=true&category_id=103&date=${today}`,
    {
      headers: {
        'Authorization': `Bearer ${MMP_TOKEN}`,
        'country': 'MM',
        'language': 'en'
      }
    }
  );
  const data = await response.json();

  const prices = [];
  if (data.data?.[0]?.sub_categories) {
    data.data[0].sub_categories.forEach(subCat => {
      const grouped = {};
      (subCat.items || []).forEach(item => {
        if (!grouped[item.item_name_eng] || item.created_at_date > grouped[item.item_name_eng].created_at_date) {
          grouped[item.item_name_eng] = item;
        }
      });
      Object.values(grouped).forEach(item => {
        prices.push({ name: item.item_name_eng, price: item.price });
      });
    });
  }
  return prices;
}

// Helper: Get fuel data
async function getFuelData() {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(
    `https://api.marketpricepro.com/users/home_content/data?is_today=true&category_id=104&date=${today}`,
    {
      headers: {
        'Authorization': `Bearer ${MMP_TOKEN}`,
        'country': 'MM',
        'language': 'en'
      }
    }
  );
  const data = await response.json();

  const prices = [];
  if (data.data?.[0]?.sub_categories) {
    data.data[0].sub_categories.forEach(subCat => {
      const grouped = {};
      (subCat.items || []).forEach(item => {
        if (!grouped[item.item_name_eng] || item.created_at_date > grouped[item.item_name_eng].created_at_date) {
          grouped[item.item_name_eng] = item;
        }
      });
      Object.values(grouped).forEach(item => {
        prices.push({ name: item.item_name_eng, price: item.price });
      });
    });
  }
  return prices;
}

// JSON response helper
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
      ...corsHeaders
    }
  });
}

// ============================================================
// TELEGRAM INTEGRATION
// ============================================================

/**
 * Fetch latest messages from a Telegram channel
 * Requires the bot to be added to the channel as admin
 */
async function fetchTelegramChannel(channelUsername, botToken, limit = 10) {
  if (!botToken) {
    return { success: false, error: 'No Telegram bot token configured' };
  }

  try {
    // Get channel messages using getUpdates or channel history
    // Note: Bot must be admin in the channel
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getUpdates?limit=${limit}`
    );
    const data = await response.json();

    if (!data.ok) {
      return { success: false, error: data.description };
    }

    // Filter messages from the specific channel
    const channelMessages = data.result.filter(update =>
      update.channel_post?.chat?.username?.toLowerCase() === channelUsername.toLowerCase()
    );

    return { success: true, messages: channelMessages };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetch channel messages via public web preview (no bot required)
 * This method scrapes t.me/s/{channel} which is publicly accessible
 */
async function fetchTelegramPublic(channelUsername) {
  try {
    const response = await fetch(`https://t.me/s/${channelUsername}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();

    // Extract message content from HTML
    const messages = [];
    const messageRegex = /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    let match;

    while ((match = messageRegex.exec(html)) !== null) {
      // Clean HTML tags
      const text = match[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .trim();

      if (text) {
        messages.push(text);
      }
    }

    // Extract images for OCR processing
    const images = [];
    const imageRegex = /background-image:url\('([^']+)'\)/g;
    while ((match = imageRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    return {
      success: true,
      messages: messages.slice(0, 10), // Latest 10 messages
      images: images.slice(0, 5)        // Latest 5 images
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Parse gold prices from Telegram message text
 * Expected format variations:
 * - "ရွှေစျေး 3,450,000 ကျပ်"
 * - "16 ပဲရည် - 3,450,000"
 * - "Gold Price: 3,450,000 MMK"
 */
function parseGoldPrices(text) {
  const prices = {};

  // Pattern for Myanmar gold prices (in Lakh format: XX,XX,XXX)
  const pricePatterns = [
    // "16 ပဲရည် - 3,450,000" or "၁၆ ပဲရည် - ၃,၄၅၀,၀၀၀"
    /(\d+|[၀-၉]+)\s*ပဲရည်[^0-9၀-၉]*([0-9,]+|[၀-၉,]+)/g,
    // "ရွှေစျေး 3,450,000" or variations
    /ရွှေ(?:စျေး|ဈေး)[^0-9၀-၉]*([0-9,]+|[၀-၉,]+)/g,
    // "Gold: 3,450,000"
    /gold[:\s]*([0-9,]+)/gi,
    // Reference price format
    /ရည်ညွှန်းစျေး[^0-9၀-၉]*([0-9,]+|[၀-၉,]+)/g
  ];

  // Myanmar numeral conversion
  const myanmarToArabic = str => {
    const map = { '၀': '0', '၁': '1', '၂': '2', '၃': '3', '၄': '4', '၅': '5', '၆': '6', '၇': '7', '၈': '8', '၉': '9' };
    return str.replace(/[၀-၉]/g, d => map[d]);
  };

  for (const pattern of pricePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const priceStr = myanmarToArabic(match[1] || match[2]).replace(/,/g, '');
      const price = parseInt(priceStr, 10);

      if (price > 100000) { // Valid gold price range
        if (text.includes('ရည်ညွှန်း') || text.includes('reference')) {
          prices.reference = price;
        } else if (text.includes('16') || text.includes('၁၆')) {
          prices.purity_16 = price;
        } else if (text.includes('15') || text.includes('၁၅')) {
          prices.purity_15 = price;
        } else {
          prices.market = price;
        }
      }
    }
  }

  return prices;
}

/**
 * Parse currency exchange rates from Telegram message
 * Expected format: "USD - 4,500 / 4,520" or "ဒေါ်လာ - ၄,၅၀၀"
 */
function parseCurrencyRates(text) {
  const rates = {};

  const patterns = [
    // "USD - 4,500 / 4,520" (buy/sell)
    /USD[:\s-]*([0-9,]+)\s*[\/\-]\s*([0-9,]+)/gi,
    // "ဒေါ်လာ - 4,500"
    /ဒေါ်လာ[:\s-]*([0-9,]+)/g,
    // "$1 = 4,500 Kyats"
    /\$\s*1\s*=?\s*([0-9,]+)/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const buy = parseInt((match[1] || '').replace(/,/g, ''), 10);
      const sell = match[2] ? parseInt(match[2].replace(/,/g, ''), 10) : buy;

      if (buy > 1000 && buy < 100000) { // Valid USD/MMK range
        rates.USD = { buy, sell };
      }
    }
  }

  return rates;
}

/**
 * Parse fuel prices from Telegram message
 * Expected format: "Octane 92 - 1,850 ကျပ်"
 */
function parseFuelPrices(text) {
  const prices = {};

  const fuelTypes = [
    { name: 'Octane 92', patterns: [/octane\s*92[:\s-]*([0-9,]+)/gi, /92\s*ရန်[:\s-]*([0-9,]+)/gi] },
    { name: 'Octane 95', patterns: [/octane\s*95[:\s-]*([0-9,]+)/gi, /95\s*ရန်[:\s-]*([0-9,]+)/gi] },
    { name: 'Diesel', patterns: [/diesel[:\s-]*([0-9,]+)/gi, /ဒီဇယ်[:\s-]*([0-9,]+)/gi] },
    { name: 'Premium Diesel', patterns: [/premium\s*diesel[:\s-]*([0-9,]+)/gi] }
  ];

  for (const fuel of fuelTypes) {
    for (const pattern of fuel.patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const price = parseInt(match[1].replace(/,/g, ''), 10);
        if (price > 500 && price < 10000) { // Valid fuel price range
          prices[fuel.name] = price;
        }
      }
    }
  }

  return prices;
}

/**
 * Get gold prices - Try Telegram first, fallback to MarketPricePro
 */
async function getGoldPricesWithTelegram(env) {
  // Try Telegram public scraping first
  const telegramResult = await fetchTelegramPublic(TELEGRAM_CHANNELS.YGEA);

  if (telegramResult.success && telegramResult.messages.length > 0) {
    const allPrices = {};

    // Parse all messages for prices
    for (const msg of telegramResult.messages) {
      const parsed = parseGoldPrices(msg);
      Object.assign(allPrices, parsed);
    }

    if (Object.keys(allPrices).length > 0) {
      return jsonResponse({
        source: 'Telegram (YGEA)',
        sourceChannel: `@${TELEGRAM_CHANNELS.YGEA}`,
        category: 'Gold',
        prices: allPrices,
        rawMessages: telegramResult.messages.slice(0, 3),
        timestamp: new Date().toISOString()
      });
    }
  }

  // Fallback to MarketPricePro
  return await getGoldPrices();
}

/**
 * New endpoint: Get data sources status
 */
async function getSourcesStatus() {
  const sources = {
    telegram: {
      goldcurrencyupdate: {
        channel: `@${TELEGRAM_CHANNELS.GOLD_CURRENCY}`,
        status: 'active',
        note: 'BEST SOURCE - Posts prices as TEXT (no OCR needed)',
        recommended: true
      },
      ygea: { channel: `@${TELEGRAM_CHANNELS.YGEA}`, status: 'active', note: 'Posts prices as images (OCR required)' },
      goldMarket: { channel: `@${TELEGRAM_CHANNELS.GOLD_MARKET}`, status: 'uncertain' },
      denko: { channel: `@${TELEGRAM_CHANNELS.DENKO}`, status: 'active', note: 'Posts prices as images (OCR required)' }
    },
    marketPricePro: { status: 'active', note: 'Reliable backup data source' },
    cbm: { status: 'active', endpoint: 'https://forex.cbm.gov.mm/api/latest' }
  };

  return jsonResponse({
    sources,
    recommended: '/gold/live or /gold/best for real-time Telegram prices',
    timestamp: new Date().toISOString()
  });
}

/**
 * OCR: Extract text from image using Workers AI
 * Requires AI binding in wrangler.toml
 */
async function extractTextFromImage(imageUrl, ai, customPrompt = null) {
  if (!ai) {
    return { success: false, error: 'Workers AI not configured' };
  }

  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    const defaultPrompt = 'Extract all numbers and prices from this image. List each price with its label.';

    // Use LLaVA model for image-to-text
    const result = await ai.run('@cf/llava-hf/llava-1.5-7b-hf', {
      image: [...new Uint8Array(imageBuffer)],
      prompt: customPrompt || defaultPrompt,
      max_tokens: 512
    });

    return {
      success: true,
      text: result.response || result.description || ''
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * OCR: Extract fuel prices from image
 * Specific prompt for fuel price tables
 */
async function extractFuelPricesFromImage(imageUrl, ai) {
  const fuelPrompt = `This is a fuel price table from Myanmar. Extract the prices for:
- Octane 92 (or 92 RON)
- Octane 95 (or 95 RON)
- Diesel (or HSD)
- Premium Diesel (or Euro 5 or PHSD)

List each fuel type with its price in numbers. Format: "Octane 92: XXXX, Diesel: XXXX"
Only output the fuel names and numbers, nothing else.`;

  return await extractTextFromImage(imageUrl, ai, fuelPrompt);
}

/**
 * Get gold prices with OCR from Telegram images
 */
async function getGoldPricesWithOCR(env) {
  // Fetch YGEA channel
  const telegramResult = await fetchTelegramPublic(TELEGRAM_CHANNELS.YGEA);

  if (!telegramResult.success) {
    return await getGoldPrices(); // Fallback
  }

  const prices = {
    source: 'Telegram (YGEA)',
    channel: `@${TELEGRAM_CHANNELS.YGEA}`,
    method: 'ocr',
    data: {},
    rawMessages: telegramResult.messages.slice(0, 3),
    images: telegramResult.images.slice(0, 3),
    timestamp: new Date().toISOString()
  };

  // If we have AI binding and images, try OCR
  if (env?.AI && telegramResult.images.length > 0) {
    for (const imageUrl of telegramResult.images.slice(0, 2)) {
      const ocrResult = await extractTextFromImage(imageUrl, env.AI);
      if (ocrResult.success) {
        const parsed = parseGoldPrices(ocrResult.text);
        Object.assign(prices.data, parsed);
        prices.ocrText = ocrResult.text;
      }
    }
  }

  // If OCR found prices, return them
  if (Object.keys(prices.data).length > 0) {
    return jsonResponse(prices);
  }

  // Otherwise fallback to MarketPricePro
  return await getGoldPrices();
}

/**
 * Debug endpoint: Show raw Telegram scrape results
 */
async function debugTelegramScrape(channel) {
  const result = await fetchTelegramPublic(channel);
  return jsonResponse({
    channel: `@${channel}`,
    success: result.success,
    messageCount: result.messages?.length || 0,
    imageCount: result.images?.length || 0,
    messages: result.messages || [],
    images: result.images || [],
    error: result.error,
    timestamp: new Date().toISOString()
  });
}

/**
 * Parse gold and currency from @goldcurrencyupdate channel
 * This channel posts TEXT prices (no OCR needed!)
 * Format examples:
 * - "အရောင်း >> 10,850,000 ကျပ်" (sell price)
 * - "အဝယ် >> 10,750,000 ကျပ်" (buy price)
 * - "USD >> 3920-4020 ks" (USD rate)
 * - "5379$" or "$5379" (international gold)
 * - "စနစ်ဟောင်း" (old system) / "စနစ်သစ်" (new system)
 *
 * Messages contain BOTH old and new system in the same post, separated by "---"
 */
function parseGoldCurrencyUpdate(messages) {
  const result = {
    gold: {
      oldSystem: {},  // စနစ်ဟောင်း
      newSystem: {}   // စနစ်သစ်
    },
    currency: {},
    international: {},
    latestDate: null
  };

  for (const text of messages) {
    // Find date in format X.X.2026 or X.3.2026
    const dateMatch = text.match(/(\d{1,2}\.\d{1,2}\.2026)/);
    if (dateMatch && !result.latestDate) {
      result.latestDate = dateMatch[1];
    }

    // Check if this is a price update message (contains ကျပ်)
    if (!text.includes('ကျပ်')) continue;

    // Split message into sections (old system and new system are separated)
    // Find old system section
    const oldSystemMatch = text.match(/စနစ်ဟောင်း[^]*?အရောင်း[^0-9]*(\d{1,2},\d{3},\d{3})\s*ကျပ်[^]*?အဝယ်[^0-9]*(\d{1,2},\d{3},\d{3})\s*ကျပ်/);
    if (oldSystemMatch) {
      result.gold.oldSystem.sell = parseInt(oldSystemMatch[1].replace(/,/g, ''), 10);
      result.gold.oldSystem.buy = parseInt(oldSystemMatch[2].replace(/,/g, ''), 10);
    }

    // Find new system section
    const newSystemMatch = text.match(/စနစ်သစ်[^]*?အရောင်း[^0-9]*(\d{1,2},\d{3},\d{3})\s*ကျပ်[^]*?အဝယ်[^0-9]*(\d{1,2},\d{3},\d{3})\s*ကျပ်/);
    if (newSystemMatch) {
      result.gold.newSystem.sell = parseInt(newSystemMatch[1].replace(/,/g, ''), 10);
      result.gold.newSystem.buy = parseInt(newSystemMatch[2].replace(/,/g, ''), 10);
    }

    // If no specific system found, try generic parsing
    if (!oldSystemMatch && !newSystemMatch) {
      const sellMatches = text.match(/အရောင်း[^0-9]*(\d{1,2},\d{3},\d{3})\s*ကျပ်/g);
      const buyMatches = text.match(/အဝယ်[^0-9]*(\d{1,2},\d{3},\d{3})\s*ကျပ်/g);

      if (sellMatches && sellMatches.length >= 2) {
        // First is old system, second is new system
        const sell1 = sellMatches[0].match(/(\d{1,2},\d{3},\d{3})/);
        const sell2 = sellMatches[1].match(/(\d{1,2},\d{3},\d{3})/);
        if (sell1) result.gold.oldSystem.sell = parseInt(sell1[1].replace(/,/g, ''), 10);
        if (sell2) result.gold.newSystem.sell = parseInt(sell2[1].replace(/,/g, ''), 10);
      }

      if (buyMatches && buyMatches.length >= 2) {
        const buy1 = buyMatches[0].match(/(\d{1,2},\d{3},\d{3})/);
        const buy2 = buyMatches[1].match(/(\d{1,2},\d{3},\d{3})/);
        if (buy1) result.gold.oldSystem.buy = parseInt(buy1[1].replace(/,/g, ''), 10);
        if (buy2) result.gold.newSystem.buy = parseInt(buy2[1].replace(/,/g, ''), 10);
      }
    }

    // USD/MMK rate (USD >> XXXX-XXXX ks)
    const usdMatch = text.match(/USD[^0-9]*(\d{3,4})\s*[-–]\s*(\d{3,4})\s*ks/i);
    if (usdMatch && !result.currency.USD) {
      result.currency.USD = {
        buy: parseInt(usdMatch[1], 10),
        sell: parseInt(usdMatch[2], 10)
      };
    }

    // International gold price ($XXXX or XXXX$ or XXXX&#036;)
    const intlGoldMatches = text.match(/(\d{4,5})\s*(?:&#036;|\$)/g);
    if (intlGoldMatches) {
      for (const m of intlGoldMatches) {
        const priceMatch = m.match(/(\d{4,5})/);
        if (priceMatch) {
          const price = parseInt(priceMatch[1], 10);
          if (price > 1000 && price < 10000) {
            if (!result.international.high || price > result.international.high) {
              result.international.high = price;
            }
            if (!result.international.low || price < result.international.low) {
              result.international.low = price;
            }
          }
        }
      }
    }
  }

  // Set purity
  if (result.gold.oldSystem.sell || result.gold.newSystem.sell) {
    result.gold.purity = '16-pè (16 ပဲရည်)';
  }

  return result;
}

/**
 * Get gold prices from @goldcurrencyupdate (TEXT-based, best source)
 */
async function getGoldFromTelegramText() {
  const telegramResult = await fetchTelegramPublic(TELEGRAM_CHANNELS.GOLD_CURRENCY);

  if (!telegramResult.success) {
    // Fallback to MarketPricePro
    return await getGoldPrices();
  }

  const parsed = parseGoldCurrencyUpdate(telegramResult.messages);

  const hasOldSystem = parsed.gold.oldSystem.sell || parsed.gold.oldSystem.buy;
  const hasNewSystem = parsed.gold.newSystem.sell || parsed.gold.newSystem.buy;

  // Check if we got valid data
  if (hasOldSystem || hasNewSystem) {
    return jsonResponse({
      source: 'Telegram',
      channel: `@${TELEGRAM_CHANNELS.GOLD_CURRENCY}`,
      method: 'text_scraping',
      date: parsed.latestDate,
      gold: {
        purity: parsed.gold.purity,
        oldSystem: parsed.gold.oldSystem,
        newSystem: parsed.gold.newSystem
      },
      currency: parsed.currency,
      international: parsed.international,
      rawMessages: telegramResult.messages.slice(0, 5),
      timestamp: new Date().toISOString()
    });
  }

  // Fallback
  return await getGoldPrices();
}

/**
 * Combined endpoint: Get best available gold data
 * Priority: goldcurrencyupdate (text) > YGEA (images/OCR) > MarketPricePro
 */
async function getBestGoldPrices(env) {
  // Try text-based channel first (best source)
  const textResult = await fetchTelegramPublic(TELEGRAM_CHANNELS.GOLD_CURRENCY);

  if (textResult.success && textResult.messages.length > 0) {
    const parsed = parseGoldCurrencyUpdate(textResult.messages);

    const hasOldSystem = parsed.gold.oldSystem.sell || parsed.gold.oldSystem.buy;
    const hasNewSystem = parsed.gold.newSystem.sell || parsed.gold.newSystem.buy;

    if (hasOldSystem || hasNewSystem) {
      return jsonResponse({
        source: 'Telegram',
        channel: '@goldcurrencyupdate',
        method: 'text_scraping',
        date: parsed.latestDate,
        gold: {
          purity: '16-pè (16 ပဲရည်)',
          oldSystem: hasOldSystem ? {
            name: 'စနစ်ဟောင်း (Old System)',
            sell: parsed.gold.oldSystem.sell,
            buy: parsed.gold.oldSystem.buy,
            sellFormatted: parsed.gold.oldSystem.sell?.toLocaleString() + ' MMK',
            buyFormatted: parsed.gold.oldSystem.buy?.toLocaleString() + ' MMK'
          } : null,
          newSystem: hasNewSystem ? {
            name: 'စနစ်သစ် (New System)',
            sell: parsed.gold.newSystem.sell,
            buy: parsed.gold.newSystem.buy,
            sellFormatted: parsed.gold.newSystem.sell?.toLocaleString() + ' MMK',
            buyFormatted: parsed.gold.newSystem.buy?.toLocaleString() + ' MMK'
          } : null
        },
        currency: {
          USD: parsed.currency.USD ? {
            buy: parsed.currency.USD.buy,
            sell: parsed.currency.USD.sell,
            formatted: `${parsed.currency.USD.buy} - ${parsed.currency.USD.sell} MMK`
          } : null
        },
        international: parsed.international.high ? {
          goldUSD: {
            high: parsed.international.high,
            low: parsed.international.low,
            formatted: `$${parsed.international.low} - $${parsed.international.high}`
          }
        } : null,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Fallback to MarketPricePro
  return await getGoldPrices();
}

// ============================================================
// SDB (Spring Development Bank) INTEGRATION
// ============================================================

/**
 * Base64URL decode helper
 */
function base64UrlDecode(str) {
  // Replace URL-safe characters and add padding
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

/**
 * Import RSA private key from PEM for JWE decryption
 */
async function importPrivateKey(pem) {
  // Remove PEM headers and decode
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    false,
    ['decrypt']
  );
}

/**
 * Decrypt JWE compact token (RSA-OAEP-256 + A256GCM)
 */
async function decryptJWE(jwe) {
  const parts = jwe.split('.');
  if (parts.length !== 5) {
    throw new Error('Invalid JWE format');
  }

  const [headerB64, encKeyB64, ivB64, ciphertextB64, tagB64] = parts;

  // Parse header
  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64)));

  if (header.alg !== 'RSA-OAEP-256' || header.enc !== 'A256GCM') {
    throw new Error(`Unsupported JWE algorithm: ${header.alg}/${header.enc}`);
  }

  // Import private key
  const privateKey = await importPrivateKey(SDB_PRIVATE_KEY_PEM);

  // Decrypt the content encryption key (CEK)
  const encryptedKey = base64UrlDecode(encKeyB64);
  const cek = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encryptedKey
  );

  // Import CEK for AES-GCM decryption
  const aesKey = await crypto.subtle.importKey(
    'raw',
    cek,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // Decode IV and ciphertext
  const iv = base64UrlDecode(ivB64);
  const ciphertext = base64UrlDecode(ciphertextB64);
  const tag = base64UrlDecode(tagB64);

  // Combine ciphertext and tag for AES-GCM
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  // Additional authenticated data (AAD) is the protected header
  const aad = new TextEncoder().encode(headerB64);

  // Decrypt
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      additionalData: aad,
      tagLength: 128
    },
    aesKey,
    combined
  );

  return new TextDecoder().decode(plaintext);
}

/**
 * Base64URL encode helper
 */
function base64UrlEncode(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Import RSA public key from PEM for JWE encryption
 */
async function importPublicKey(pem) {
  const pemContents = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    'spki',
    binaryKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    false,
    ['encrypt']
  );
}

/**
 * Encrypt payload to JWE compact token (RSA-OAEP-256 + A256GCM)
 */
async function encryptJWE(payload) {
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));

  // Generate random CEK (256 bits for A256GCM)
  const cek = crypto.getRandomValues(new Uint8Array(32));

  // Generate random IV (96 bits for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Create JWE header
  const header = {
    alg: 'RSA-OAEP-256',
    enc: 'A256GCM'
  };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));

  // Import public key and encrypt CEK
  const publicKey = await importPublicKey(SDB_PUBLIC_KEY_PEM);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    cek
  );

  // Import CEK for AES-GCM encryption
  const aesKey = await crypto.subtle.importKey(
    'raw',
    cek,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // AAD is the protected header
  const aad = new TextEncoder().encode(headerB64);

  // Encrypt payload
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      additionalData: aad,
      tagLength: 128
    },
    aesKey,
    payloadBytes
  );

  // Split ciphertext and tag (tag is last 16 bytes)
  const encryptedArray = new Uint8Array(encrypted);
  const ciphertext = encryptedArray.slice(0, -16);
  const tag = encryptedArray.slice(-16);

  // Build compact JWE
  return [
    headerB64,
    base64UrlEncode(encryptedKey),
    base64UrlEncode(iv),
    base64UrlEncode(ciphertext),
    base64UrlEncode(tag)
  ].join('.');
}

/**
 * Get SDB exchange rates
 * Requires Bearer token in Authorization header
 * Token expires every 10 minutes, user must refresh via SDB app login
 */
async function getSDBCurrency(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return jsonResponse({
      error: 'Missing Bearer token',
      message: 'Please provide your SDB Bearer token in the Authorization header',
      note: 'Login to SDB app/web to get a fresh token (expires every 10 minutes)',
      example: 'Authorization: Bearer eyJhbGciOiJSUz...'
    }, 401);
  }

  try {
    // Call SDB API
    const response = await fetch(`${SDB_API_URL}/v1/dashboard/summary`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return jsonResponse({
        error: 'SDB API request failed',
        status: response.status,
        message: response.status === 401 ? 'Token expired. Please login again.' : 'API error'
      }, response.status);
    }

    const data = await response.json();

    if (!data.encrypt) {
      return jsonResponse({
        error: 'Unexpected response format',
        message: 'Response does not contain encrypted data'
      }, 500);
    }

    // Decrypt the response
    const decrypted = await decryptJWE(data.encrypt);
    const parsed = JSON.parse(decrypted);

    // Extract exchange rates
    const rates = {};
    if (parsed.exchangeRates && Array.isArray(parsed.exchangeRates)) {
      for (const rate of parsed.exchangeRates) {
        rates[rate.currencyCode] = {
          buy: rate.buyRate,
          sell: rate.sellRate,
          flag: rate.flagEmoji
        };
      }
    }

    // Extract gold rate
    let goldRate = null;
    if (parsed.goldRate) {
      goldRate = {
        buy: parsed.goldRate.buyRate,
        sell: parsed.goldRate.sellRate,
        unit: 'MMK per unit'
      };
    }

    return jsonResponse({
      source: 'Spring Development Bank',
      type: 'bank_rate',
      rates,
      goldRate,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      error: 'Decryption failed',
      message: error.message,
      hint: 'Token may have expired. Please login to SDB again.'
    }, 500);
  }
}

/**
 * Decrypt any SDB encrypted response
 * POST body should contain { "encrypt": "eyJ..." }
 */
async function decryptSDBResponse(request) {
  if (request.method !== 'POST') {
    return jsonResponse({
      error: 'Method not allowed',
      message: 'POST with JSON body { "encrypt": "..." }'
    }, 405);
  }

  try {
    const body = await request.json();

    if (!body.encrypt) {
      return jsonResponse({
        error: 'Missing encrypt field',
        message: 'POST body should contain { "encrypt": "eyJ..." }'
      }, 400);
    }

    const decrypted = await decryptJWE(body.encrypt);
    const parsed = JSON.parse(decrypted);

    return jsonResponse({
      success: true,
      data: parsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      error: 'Decryption failed',
      message: error.message
    }, 500);
  }
}

/**
 * SDB Login - Get access token and refresh token
 * POST body: { "email": "...", "password": "..." }
 */
async function sdbLogin(request) {
  if (request.method !== 'POST') {
    return jsonResponse({
      error: 'Method not allowed',
      message: 'POST with JSON body { "email": "...", "password": "..." }'
    }, 405);
  }

  try {
    const body = await request.json();

    if (!body.email || !body.password) {
      return jsonResponse({
        error: 'Missing credentials',
        message: 'POST body should contain { "email": "...", "password": "..." }'
      }, 400);
    }

    // Encrypt the login payload
    const encryptedPayload = await encryptJWE({
      email: body.email,
      password: body.password
    });

    // Call SDB login API with encrypted payload
    const response = await fetch(`${SDB_API_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ encrypt: encryptedPayload })
    });

    const data = await response.json();

    if (!response.ok) {
      return jsonResponse({
        error: 'Login failed',
        status: response.status,
        message: data.message || data.error || 'Authentication failed'
      }, response.status);
    }

    // Check if response is encrypted
    if (data.encrypt) {
      const decrypted = await decryptJWE(data.encrypt);
      const parsed = JSON.parse(decrypted);

      return jsonResponse({
        success: true,
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        expiresIn: parsed.expiresIn || '10 minutes',
        user: parsed.user ? {
          id: parsed.user.id,
          email: parsed.user.email,
          name: parsed.user.name
        } : null,
        timestamp: new Date().toISOString()
      });
    }

    // If not encrypted, return as-is
    return jsonResponse({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      error: 'Login failed',
      message: error.message
    }, 500);
  }
}

/**
 * SDB Refresh - Get new access token using refresh token
 * Requires refresh token in Authorization header
 */
async function sdbRefresh(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return jsonResponse({
      error: 'Missing refresh token',
      message: 'Provide refresh token in Authorization header',
      example: 'Authorization: Bearer <refresh_token>'
    }, 401);
  }

  try {
    const response = await fetch(`${SDB_API_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return jsonResponse({
        error: 'Refresh failed',
        status: response.status,
        message: data.message || 'Token refresh failed'
      }, response.status);
    }

    // Check if response is encrypted
    if (data.encrypt) {
      const decrypted = await decryptJWE(data.encrypt);
      const parsed = JSON.parse(decrypted);

      return jsonResponse({
        success: true,
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        expiresIn: parsed.expiresIn || '10 minutes',
        timestamp: new Date().toISOString()
      });
    }

    return jsonResponse({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      error: 'Refresh failed',
      message: error.message
    }, 500);
  }
}

/**
 * SDB Rates with Auto-Login and Token Caching
 * Uses KV storage to cache access tokens for 9 minutes (tokens expire in 10 min)
 * POST body: { "email": "...", "password": "..." }
 * Or use stored credentials in environment variables (SDB_EMAIL, SDB_PASSWORD)
 */
async function getSDBRatesAuto(request, env) {
  let email, password;

  // Check for credentials in request body (POST) or environment
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch (e) {
      // Ignore JSON parse errors, try env vars
    }
  }

  // Fall back to environment variables
  if (!email || !password) {
    email = env?.SDB_EMAIL;
    password = env?.SDB_PASSWORD;
  }

  if (!email || !password) {
    return jsonResponse({
      error: 'Missing credentials',
      message: 'Either POST { "email": "...", "password": "..." } or configure SDB_EMAIL and SDB_PASSWORD environment variables',
      endpoints: {
        login: 'POST /sdb/login with credentials to get tokens',
        rates: 'GET /currency/sdb with Bearer token',
        auto: 'POST /sdb/rates with credentials for one-step access'
      }
    }, 400);
  }

  try {
    let accessToken;
    let tokenSource = 'fresh_login';

    // Step 1: Check for cached token in KV
    if (env?.SDB_TOKEN_CACHE) {
      const cachedToken = await env.SDB_TOKEN_CACHE.get('sdb_access_token');
      if (cachedToken) {
        accessToken = cachedToken;
        tokenSource = 'cached';
      }
    }

    // Step 2: If no cached token, login to get new one
    if (!accessToken) {
      const encryptedPayload = await encryptJWE({ email, password });

      const loginResponse = await fetch(`${SDB_API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ encrypt: encryptedPayload })
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        return jsonResponse({
          error: 'Login failed',
          status: loginResponse.status,
          sdbError: loginData,
          emailUsed: email ? email.substring(0, 3) + '***' : 'none',
          message: loginData.message || loginData.error || 'Authentication failed'
        }, loginResponse.status);
      }

      // Decrypt login response to get token
      if (loginData.encrypt) {
        const decrypted = await decryptJWE(loginData.encrypt);
        const parsedLogin = JSON.parse(decrypted);
        accessToken = parsedLogin.data?.access_token || parsedLogin.accessToken;
      } else {
        accessToken = loginData.data?.access_token || loginData.accessToken;
      }

      if (!accessToken) {
        return jsonResponse({
          error: 'No access token received',
          message: 'Login succeeded but no token was returned'
        }, 500);
      }

      // Cache the token for 9 minutes (540 seconds) - expires before the 10 min token expiry
      if (env?.SDB_TOKEN_CACHE) {
        await env.SDB_TOKEN_CACHE.put('sdb_access_token', accessToken, { expirationTtl: 540 });
      }
    }

    // Step 3: Fetch exchange rates with the token
    let ratesResponse = await fetch(`${SDB_API_URL}/v1/dashboard/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    // If token expired (401), clear cache and retry with fresh login
    if (ratesResponse.status === 401 && tokenSource === 'cached') {
      // Clear expired token from cache
      if (env?.SDB_TOKEN_CACHE) {
        await env.SDB_TOKEN_CACHE.delete('sdb_access_token');
      }

      // Login again
      const encryptedPayload = await encryptJWE({ email, password });
      const loginResponse = await fetch(`${SDB_API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ encrypt: encryptedPayload })
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        return jsonResponse({
          error: 'Re-login failed after token expiry',
          status: loginResponse.status
        }, loginResponse.status);
      }

      // Get new token
      if (loginData.encrypt) {
        const decrypted = await decryptJWE(loginData.encrypt);
        const parsedLogin = JSON.parse(decrypted);
        accessToken = parsedLogin.data?.access_token || parsedLogin.accessToken;
      }

      // Cache the new token
      if (env?.SDB_TOKEN_CACHE && accessToken) {
        await env.SDB_TOKEN_CACHE.put('sdb_access_token', accessToken, { expirationTtl: 540 });
      }

      // Retry fetching rates
      ratesResponse = await fetch(`${SDB_API_URL}/v1/dashboard/summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      tokenSource = 'refreshed';
    }

    const ratesData = await ratesResponse.json();

    if (!ratesResponse.ok) {
      return jsonResponse({
        error: 'Failed to fetch rates',
        status: ratesResponse.status
      }, ratesResponse.status);
    }

    // Decrypt and parse rates
    if (!ratesData.encrypt) {
      return jsonResponse({
        error: 'Unexpected response format'
      }, 500);
    }

    const decrypted = await decryptJWE(ratesData.encrypt);
    const parsed = JSON.parse(decrypted);

    // The response structure is nested under data
    const ratesObj = parsed.data || parsed;

    // Extract exchange rates from exchange_rates.rates array
    const rates = {};
    let goldRate = null;
    const exchangeRatesData = ratesObj.exchange_rates?.rates || [];

    for (const rate of exchangeRatesData) {
      const code = rate.base_currency?.code;
      const buyRate = parseFloat(rate.buy_rate);
      const sellRate = parseFloat(rate.sell_rate);

      if (code === 'GOLD') {
        goldRate = {
          buy: buyRate,
          sell: sellRate,
          buyFormatted: Math.round(buyRate).toLocaleString() + ' MMK',
          sellFormatted: Math.round(sellRate).toLocaleString() + ' MMK',
          unit: 'MMK per unit'
        };
      } else if (code && code !== 'SDB') {
        rates[code] = {
          name: rate.base_currency?.name,
          buy: buyRate,
          sell: sellRate,
          buyFormatted: buyRate.toFixed(2) + ' MMK',
          sellFormatted: sellRate.toFixed(2) + ' MMK'
        };
      }
    }

    // Get last updated timestamp
    const lastUpdated = ratesObj.exchange_rates?.last_updated_at;

    return jsonResponse({
      source: 'Spring Development Bank',
      type: 'bank_rate',
      method: 'auto_login',
      tokenSource, // 'cached', 'fresh_login', or 'refreshed'
      lastUpdated,
      rates,
      goldRate,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      error: 'Failed to fetch SDB rates',
      message: error.message
    }, 500);
  }
}

// ============================================================
// FUEL PRICES FROM TELEGRAM (OCR)
// ============================================================

/**
 * Parse fuel prices from OCR text
 * Expected format from Denko images:
 * - Octane 92: X,XXX Ks
 * - Octane 95: X,XXX Ks
 * - Diesel: X,XXX Ks
 * - Premium Diesel: X,XXX Ks
 */
function parseFuelPricesFromOCR(text) {
  const prices = {};

  // Common patterns for fuel prices
  const patterns = [
    // Octane 92
    { name: 'Octane 92', regex: /(?:octane\s*92|92\s*(?:ron|octane)?)[:\s-]*([0-9,]+)/gi },
    { name: 'Octane 92', regex: /92[:\s]*([0-9,]+)\s*(?:ks|kyat|ကျပ်)/gi },
    // Octane 95
    { name: 'Octane 95', regex: /(?:octane\s*95|95\s*(?:ron|octane)?)[:\s-]*([0-9,]+)/gi },
    { name: 'Octane 95', regex: /95[:\s]*([0-9,]+)\s*(?:ks|kyat|ကျပ်)/gi },
    // Diesel
    { name: 'Diesel', regex: /(?:diesel|ဒီဇယ်)[:\s-]*([0-9,]+)/gi },
    { name: 'Diesel', regex: /(?:HSD|high\s*speed\s*diesel)[:\s-]*([0-9,]+)/gi },
    // Premium Diesel
    { name: 'Premium Diesel', regex: /(?:premium\s*diesel|euro\s*5)[:\s-]*([0-9,]+)/gi },
    { name: 'Premium Diesel', regex: /(?:PHSD|premium\s*HSD)[:\s-]*([0-9,]+)/gi }
  ];

  for (const { name, regex } of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const priceStr = match[1].replace(/,/g, '');
      const price = parseInt(priceStr, 10);
      // Valid fuel price range: 1000-20000 MMK/liter
      if (price >= 1000 && price <= 20000) {
        prices[name] = price;
      }
    }
  }

  return prices;
}

/**
 * Get fuel prices from DenkoTrading Telegram with OCR
 */
async function getFuelFromTelegram(env) {
  // Check if Workers AI is configured
  if (!env?.AI) {
    return jsonResponse({
      error: 'Workers AI not configured',
      message: 'OCR requires AI binding in wrangler.toml',
      fallback: 'Use /fuel for MarketPricePro data'
    }, 503);
  }

  try {
    // Fetch DenkoTrading channel
    const telegramResult = await fetchTelegramPublic(TELEGRAM_CHANNELS.DENKO);

    if (!telegramResult.success) {
      return await getFuelPrices(); // Fallback to MarketPricePro
    }

    // Get the latest image
    const images = telegramResult.images?.filter(img =>
      img.includes('telesco.pe') || img.includes('telegram.org/file')
    ) || [];

    if (images.length === 0) {
      return jsonResponse({
        error: 'No fuel price images found',
        channel: '@DenkoTrading',
        fallback: 'Use /fuel for MarketPricePro data'
      }, 404);
    }

    // Process first image with OCR using fuel-specific prompt
    const imageUrl = images[0];
    const ocrResult = await extractFuelPricesFromImage(imageUrl, env.AI);

    if (!ocrResult.success) {
      return jsonResponse({
        error: 'OCR failed',
        message: ocrResult.error,
        fallback: 'Use /fuel for MarketPricePro data'
      }, 500);
    }

    // Parse fuel prices from OCR text
    const prices = parseFuelPricesFromOCR(ocrResult.text);

    // Extract date from messages
    let date = null;
    for (const msg of telegramResult.messages) {
      const dateMatch = msg.match(/(\d{1,2}\.\d{1,2}\.2026)/);
      if (dateMatch) {
        date = dateMatch[1];
        break;
      }
    }

    if (Object.keys(prices).length > 0) {
      return jsonResponse({
        source: 'Telegram',
        channel: '@DenkoTrading',
        method: 'ocr',
        date,
        prices: {
          'Octane 92': prices['Octane 92'] ? {
            price: prices['Octane 92'],
            formatted: prices['Octane 92'].toLocaleString() + ' MMK/L'
          } : null,
          'Octane 95': prices['Octane 95'] ? {
            price: prices['Octane 95'],
            formatted: prices['Octane 95'].toLocaleString() + ' MMK/L'
          } : null,
          'Diesel': prices['Diesel'] ? {
            price: prices['Diesel'],
            formatted: prices['Diesel'].toLocaleString() + ' MMK/L'
          } : null,
          'Premium Diesel': prices['Premium Diesel'] ? {
            price: prices['Premium Diesel'],
            formatted: prices['Premium Diesel'].toLocaleString() + ' MMK/L'
          } : null
        },
        ocrText: ocrResult.text,
        timestamp: new Date().toISOString()
      });
    }

    // If no prices parsed, return OCR text for debugging
    return jsonResponse({
      source: 'Telegram',
      channel: '@DenkoTrading',
      method: 'ocr',
      warning: 'Could not parse fuel prices from OCR',
      ocrText: ocrResult.text,
      imageUrl,
      fallback: 'Use /fuel for MarketPricePro data',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      error: 'Failed to fetch fuel prices',
      message: error.message
    }, 500);
  }
}

/**
 * Get best available fuel prices
 * Priority: DenkoTrading OCR > MarketPricePro
 */
async function getBestFuelPrices(env) {
  // Try Telegram OCR first if AI is available
  if (env?.AI) {
    try {
      const telegramResult = await fetchTelegramPublic(TELEGRAM_CHANNELS.DENKO);

      if (telegramResult.success && telegramResult.images?.length > 0) {
        const images = telegramResult.images.filter(img =>
          img.includes('telesco.pe') || img.includes('telegram.org/file')
        );

        if (images.length > 0) {
          const ocrResult = await extractFuelPricesFromImage(images[0], env.AI);

          if (ocrResult.success) {
            const prices = parseFuelPricesFromOCR(ocrResult.text);

            if (Object.keys(prices).length > 0) {
              // Extract date
              let date = null;
              for (const msg of telegramResult.messages) {
                const dateMatch = msg.match(/(\d{1,2}\.\d{1,2}\.2026)/);
                if (dateMatch) {
                  date = dateMatch[1];
                  break;
                }
              }

              return jsonResponse({
                source: 'Telegram',
                channel: '@DenkoTrading',
                method: 'ocr',
                date,
                prices: Object.fromEntries(
                  Object.entries(prices).map(([name, price]) => [
                    name,
                    { price, formatted: price.toLocaleString() + ' MMK/L' }
                  ])
                ),
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (e) {
      // Fall through to MarketPricePro
    }
  }

  // Fallback to MarketPricePro
  return await getFuelPrices();
}
