const {fail,text} = require('./portal-model');
const defaults = {
  checkEnabled:true,
  bankTransferEnabled:true,
  checkInstructions:'Please contact Maison Lucia using the Conversation tab to arrange payment by check. Make the check payable to Maison Lucia LLC.',
  bankTransferInstructions:'Please contact Maison Lucia using the Conversation tab to request bank transfer or wire instructions. Confirm the details directly with Maison Lucia using a phone number you already know before sending funds.'
};
function paymentOptions(value = {}) {
  return {...defaults,...Object.fromEntries(Object.keys(defaults).filter(key=>Object.hasOwn(value || {},key)).map(key=>[key,value[key]]))};
}
function cleanPaymentOptions(input) {
  if (!input || typeof input.checkEnabled !== 'boolean' || typeof input.bankTransferEnabled !== 'boolean') fail('Choose which payment options to offer.');
  const result={checkEnabled:input.checkEnabled,bankTransferEnabled:input.bankTransferEnabled,
    checkInstructions:text(input.checkInstructions || '',2000),bankTransferInstructions:text(input.bankTransferInstructions || '',2000)};
  if (result.checkEnabled && !result.checkInstructions || result.bankTransferEnabled && !result.bankTransferInstructions) fail('Add instructions for each enabled payment option.');
  return result;
}
async function savePaymentOptions(db,projectId,input) {
  const options=cleanPaymentOptions(input);
  await db.query('UPDATE ml_projects SET payment_options=$1 WHERE id=$2',[options,projectId]);
  return {ok:true};
}
module.exports={paymentOptions,cleanPaymentOptions,savePaymentOptions};
