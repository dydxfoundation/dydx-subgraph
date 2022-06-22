import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { DYDX_ETH_03_ADDRESS, UNISWAP_Q192, USDC_WETH_03_ADDRESS } from "./constants";
import { UniswapV3Pool } from '../../generated/DydxToken/UniswapV3Pool';

function getEthPriceUsd(): BigDecimal {
  let uniPool = UniswapV3Pool.bind(Address.fromString(USDC_WETH_03_ADDRESS));

  let token0Decimals = BigDecimal.fromString('1e6'); // USDC 6 decimals
  let token1Decimals = BigDecimal.fromString('1e18'); // WETH 18 decimals

  let poolValue = uniPool.slot0().value0.toBigDecimal();
  let exchangeRate = poolValue
    .times(poolValue)
    .div(UNISWAP_Q192)
    .times(token0Decimals)
    .div(token1Decimals);

  return exchangeRate;
}

function getEthPriceDydx(): BigDecimal {
  let uniPool = UniswapV3Pool.bind(Address.fromString(DYDX_ETH_03_ADDRESS));

  let poolValue = uniPool.slot0().value0.toBigDecimal();
  let exchangeRate = poolValue.times(poolValue).div(UNISWAP_Q192);

  return exchangeRate;
}

// Not enough volume in the USDC-DYDX pool to estimate the price accurately
export function getdYdXPriceUsd(): BigDecimal {
  const ethPriceUsd = getEthPriceUsd();
  const ethPriceDydx = getEthPriceDydx();

  return ethPriceDydx.div(ethPriceUsd);
}
