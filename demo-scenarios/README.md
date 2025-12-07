# NetShift Demo Scenarios

Real-world examples showing how NetShift solves multi-party settlement problems.

---

## 🎰 Poker Home Game (`poker-home-game.csv`)

**Scenario**: After a weekly poker night, 4 players need to settle up.

| Who   | Owes  | Amount    |
| ----- | ----- | --------- |
| Mike  | Sarah | $150 USDC |
| Sarah | Dave  | $85 USDC  |
| Dave  | Lisa  | $120 USDC |
| Lisa  | Mike  | $200 USDC |
| Mike  | Dave  | $50 USDC  |
| Sarah | Lisa  | $75 USDC  |

**Without NetShift**: 6 separate payments  
**With NetShift**: 2-3 optimized payments (cycle detection eliminates most transfers)

---

## 🏛️ DAO Contributor Payments (`dao-contributor-payments.csv`)

**Scenario**: Monthly payroll for a DAO with contributors receiving different tokens.

| From     | To       | Amount | Token                    |
| -------- | -------- | ------ | ------------------------ |
| Treasury | Alice    | 500    | USDC (Ethereum)          |
| Treasury | Bob      | 750    | ETH                      |
| Treasury | Charlie  | 300    | USDC (Base)              |
| Treasury | Diana    | 450    | USDT (Polygon)           |
| Alice    | Treasury | 100    | USDC (reimbursement)     |
| Bob      | Treasury | 50     | ETH (overpayment return) |

**Without NetShift**: 7 separate cross-chain transactions  
**With NetShift**: Net positions calculated, 4-5 optimized settlements

---

## 🏢 Agency Payroll (`agency-payroll.csv`)

**Scenario**: Design agency collecting client payments and paying contractors.

| Client Payments | Amount      |
| --------------- | ----------- |
| ClientA → Pool  | $5,000 USDC |
| ClientB → Pool  | $3,500 USDT |
| ClientC → Pool  | $2,800 USDC |

| Freelancer Payouts | Amount      |
| ------------------ | ----------- |
| Pool → Freelancer1 | $2,500 USDC |
| Pool → Freelancer2 | $1,800 USDT |
| Pool → Freelancer3 | $3,200 USDC |
| Pool → Freelancer4 | $1,500 ETH  |
| Pool → Operations  | $2,300 USDC |

**Without NetShift**: 8 separate transfers  
**With NetShift**: Direct client→freelancer routes where possible, minimal intermediary transfers

---

## 🎮 Gaming Guild Payouts (`gaming-guild-payouts.csv`)

**Scenario**: P2E gaming guild distributing earnings and collecting manager fees.

| Payment            | Description            |
| ------------------ | ---------------------- |
| Guild → Scholar1   | 80 SLP earnings        |
| Guild → Scholar2   | 120 SLP earnings       |
| Guild → Scholar3   | 95 SLP earnings        |
| Scholar1 → Manager | 25 USDC (fee)          |
| Scholar2 → Manager | 35 USDC (fee)          |
| Scholar3 → Manager | 30 USDC (fee)          |
| Manager → Guild    | 50 USDC (contribution) |

**Without NetShift**: 7 separate transactions across chains  
**With NetShift**: Net positions calculated, scholars receive net amounts directly

---

## 💱 OTC Desk Settlement (`otc-desk-settlement.csv`)

**Scenario**: Three OTC trading desks settling bilateral trades at end of day.

| Trade         | Amount  | Asset |
| ------------- | ------- | ----- |
| DeskA → DeskB | $10,000 | USDC  |
| DeskB → DeskC | $8,500  | USDT  |
| DeskC → DeskA | $7,200  | USDC  |
| DeskA → DeskC | $3,000  | BTC   |
| DeskB → DeskA | $2,500  | ETH   |
| DeskC → DeskB | $4,500  | USDC  |

**Without NetShift**: 6 separate cross-chain transfers  
**With NetShift**: Net positions by desk, 2-3 settlement payments

---

## How to Use

1. Go to [netshift.vercel.app](https://netshift.vercel.app)
2. Click **Import CSV** on the Dashboard
3. Upload any demo file
4. Add recipient wallet addresses when prompted
5. Click **Compute** to see optimized settlement
6. Click **Execute** to process via SideShift

---

## CSV Format

```csv
from,to,amount,token,chain
Alice,Bob,100,USDC,base
```

- **from**: Payer name/identifier
- **to**: Recipient name/identifier
- **amount**: Numeric value
- **token**: Token symbol (usdc, eth, btc, etc.)
- **chain**: Network name (base, ethereum, polygon, bitcoin, etc.)
