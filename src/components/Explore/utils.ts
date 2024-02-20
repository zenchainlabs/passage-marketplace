export const shortenAddress = (address: string, count: number = 6): string => {
  const front = address.slice(0, count);
  const ellipsis = "...";

  return `${front}${ellipsis}`;
};

export const validateAddress = (
  address: string,
  loggedInAddress: string
): boolean => {
  // make sure it's not the current logged in address
  console.log("address", loggedInAddress);
  if (address === loggedInAddress) {
    return false;
  }

  // make sure it starts with pasg
  const addressPrefix = "pasg";
  if (!address.startsWith(addressPrefix)) {
    return false;
  }

  // make sure it's x characters long
  if (address.length !== 43) {
    return false;
  }
  return true;
};
