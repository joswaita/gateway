const loadBalancer = {
    ROUND_ROBIN: (service) => {
        const currentIndex = service.index;
        service.index = (service.index + 1) % service.instances.length;
        //return only enabled indexes
        return currentIndex.isEnabled(service, currentIndex, loadBalancer.ROUND_ROBIN);
    },
    // Add other strategies if needed
};
loadBalancer.isEnabled = (service, index, loadBalanceStrategy) => {
    return service.instances[index].enabled ? index : loadBalanceStrategy(service);
};
export default loadBalancer;
