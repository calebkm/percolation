class Simulation < ActiveRecord::Base
  validates :n, :o, presence: true

  def self.average(n_o_or_p)
    if all.any?
      all.inject(0) { |sum, sim| sum + sim.send(n_o_or_p) } / all.size
    else
      0
    end
  end

  def p
    o.to_f / (n * n)
  end
end