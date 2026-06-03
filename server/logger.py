import logging

def setup_logger(name = "noW"):
    logger = logging.getLogger("noW")
    logger.setLevel(logging.DEBUG)
    
    # console handler
    handler = logging.StreamHandler()
    handler.setLevel(logging.DEBUG)
    
    # formatter
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    
    # handle duplicate logger - reduce the logger to one handler
    if not logger.hasHandlers():
        logger.addHandler(handler)
    return logger

logger = setup_logger()