$LOAD_PATH << "#{Dir.pwd}/models"

# Constent Missing for requiring models files
def Object.const_missing(const)
  require const.to_s.underscore
  klass = const_get(const)
  return klass if klass
end